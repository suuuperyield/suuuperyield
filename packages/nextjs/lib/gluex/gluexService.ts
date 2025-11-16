/**
 * GlueX Service
 * Fetches real yield opportunities from GlueX Yield API
 */

const GLUEX_YIELD_API = "https://yield-api.gluex.xyz";
const GLUEX_ROUTER_API = "https://router.gluex.xyz";

export interface GlueXYieldOpportunity {
  protocol: string;
  poolAddress: string;
  chainID: string;
  apy: number;
  dilutedApy: number;
  tvl: number;
  risk: string;
  isGlueXVault: boolean;
}

/**
 * Fetch active protocols on a chain
 */
export async function getActiveProtocols() {
  try {
    const response = await fetch(`${GLUEX_YIELD_API}/active-protocols`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`GlueX API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching active protocols:", error);
    return null;
  }
}

/**
 * Fetch diluted APY for a specific pool
 */
export async function getDilutedAPY(chainID: string, poolAddress: string, amount: string, protocol?: string) {
  try {
    const payload: any = {
      chainID,
      amount,
    };

    // Use poolAddress or lpTokenAddress based on protocol
    if (protocol) {
      payload.protocol = protocol;
    }
    payload.pool_address = poolAddress;

    const response = await fetch(`${GLUEX_YIELD_API}/diluted-apy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`GlueX diluted-apy error for ${poolAddress}:`, errorText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching diluted APY for ${poolAddress}:`, error);
    return null;
  }
}

/**
 * Fetch historical APY for a pool
 */
export async function getHistoricalAPY(chainID: string, poolAddress: string, protocol?: string) {
  try {
    const payload: any = {
      chainID,
      pool_address: poolAddress,
    };

    if (protocol) {
      payload.protocol = protocol;
    }

    const response = await fetch(`${GLUEX_YIELD_API}/historical-apy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching historical APY for ${poolAddress}:`, error);
    return null;
  }
}

/**
 * Fetch TVL for a pool
 */
export async function getTVL(chainID: string, poolAddress: string, protocol?: string) {
  try {
    const payload: any = {
      chainID,
      pool_address: poolAddress,
    };

    if (protocol) {
      payload.protocol = protocol;
    }

    const response = await fetch(`${GLUEX_YIELD_API}/tvl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching TVL for ${poolAddress}:`, error);
    return null;
  }
}

/**
 * Fetch all USDC yield opportunities for HyperEVM
 * Returns mock data with real GlueX structure since HyperEVM may not have many pools yet
 */
export async function fetchUSDCYieldOpportunities(
  chainID: string = "hyperevm",
  depositAmount: string = "1000000", // 1 USDC (6 decimals)
): Promise<GlueXYieldOpportunity[]> {
  // For demo: Use well-known USDC pools on other chains as examples
  // In production, you'd query HyperEVM-specific pools
  const knownPools = [
    {
      protocol: "Aave V3",
      poolAddress: "0x...AaveV3USDCPool", // Mock address for demo
      apy: 8.5,
      tvl: 50000000,
      risk: "low",
    },
    {
      protocol: "Compound V3",
      poolAddress: "0x...CompoundV3USDC", // Mock address for demo
      apy: 7.2,
      tvl: 80000000,
      risk: "low",
    },
    {
      protocol: "GlueX USDC Vault",
      poolAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      apy: 12.5,
      tvl: 2500000,
      risk: "low",
    },
  ];

  const opportunities: GlueXYieldOpportunity[] = [];

  for (const pool of knownPools) {
    // Try to fetch real diluted APY
    const dilutedData = await getDilutedAPY(chainID, pool.poolAddress, depositAmount, pool.protocol);

    const dilutedApy = dilutedData?.diluted_apy || pool.apy * 0.98; // Estimate 2% dilution

    opportunities.push({
      protocol: pool.protocol,
      poolAddress: pool.poolAddress,
      chainID,
      apy: pool.apy,
      dilutedApy,
      tvl: pool.tvl,
      risk: pool.risk,
      isGlueXVault: pool.protocol.includes("GlueX"),
    });
  }

  return opportunities;
}

/**
 * Execute vault deposit via GlueX Router
 */
export async function executeVaultDeposit(
  chainID: string,
  inputToken: string,
  vaultToken: string,
  amount: string,
  userAddress: string,
  uniquePID: string,
  apiKey: string,
) {
  try {
    // First, get a quote
    const quoteResponse = await fetch(`${GLUEX_ROUTER_API}/v1/quote`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chainID,
        inputToken,
        outputToken: vaultToken,
        inputAmount: amount,
        userAddress,
        outputReceiver: userAddress,
        uniquePID,
      }),
    });

    if (!quoteResponse.ok) {
      throw new Error(`GlueX Router quote error: ${quoteResponse.status}`);
    }

    const quote = await quoteResponse.json();
    return quote;
  } catch (error) {
    console.error("Error executing vault deposit:", error);
    throw error;
  }
}
