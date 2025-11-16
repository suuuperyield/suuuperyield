/**
 * SuperYield Optimizer Service
 * Integrates with GlueX APIs to find highest yield opportunities
 * Uses mock data for contracts that aren't deployed yet
 */

export interface YieldOpportunity {
  id: string;
  protocol: string;
  vault: string;
  token: string;
  apy: number;
  tvl: number;
  risk: "low" | "medium" | "high";
  strategy: string;
  isGlueXVault: boolean;
}

export interface OptimizationResult {
  currentYield: number;
  bestOpportunity: YieldOpportunity;
  projectedYield: number;
  reallocationNeeded: boolean;
  transactions: TransactionStep[];
  reasoning: string;
}

export interface TransactionStep {
  type: "withdraw" | "deposit" | "swap";
  from?: string;
  to?: string;
  token: string;
  amount: string;
  calldata?: string;
  gasEstimate?: number;
}

export class YieldOptimizerService {
  /**
   * Fetch yield opportunities (mock implementation for now)
   */
  async fetchYieldOpportunities(token: string = "ETH"): Promise<YieldOpportunity[]> {
    try {
      // Try to call our API (will fallback to mock if API fails)
      const response = await fetch("/api/gluex/yields?token=" + token);

      if (response.ok) {
        const data = await response.json();
        return data.yields.map((yieldOpp: any) => ({
          id: yieldOpp.id,
          protocol: yieldOpp.protocol,
          vault: yieldOpp.vaultAddress || yieldOpp.protocol.toLowerCase().replace(" ", "_"),
          token: yieldOpp.token,
          apy: yieldOpp.apy,
          tvl: yieldOpp.tvl,
          risk: yieldOpp.risk,
          strategy: yieldOpp.strategy,
          isGlueXVault: yieldOpp.protocol.toLowerCase().includes("gluex"),
        }));
      }
    } catch (error) {
      console.warn("API call failed, using mock data:", error);
    }

    // Mock data with real GlueX vault addresses (easily replaceable later)
    return this.getMockYieldData(token);
  }

  /**
   * Find the best yield opportunity (prioritizes GlueX vaults per hackathon requirements)
   */
  findBestYieldOpportunity(
    opportunities: YieldOpportunity[],
    riskTolerance: "low" | "medium" | "high" = "medium",
  ): YieldOpportunity {
    // Filter by risk tolerance
    const filtered = opportunities.filter(op => {
      if (riskTolerance === "low") return op.risk === "low";
      if (riskTolerance === "medium") return ["low", "medium"].includes(op.risk);
      return true;
    });

    // REQUIREMENT: Prioritize GlueX vaults
    const glueXVaults = filtered.filter(op => op.isGlueXVault);
    if (glueXVaults.length > 0) {
      glueXVaults.sort((a, b) => b.apy - a.apy);
      return glueXVaults[0];
    }

    // Fallback to highest APY
    filtered.sort((a, b) => b.apy - a.apy);
    return filtered[0] || opportunities[0];
  }

  /**
   * Execute yield optimization strategy
   */
  async optimizeYield(
    currentVault: string,
    currentYield: number,
    amount: string,
    userAddress: string,
    riskTolerance: "low" | "medium" | "high" = "medium",
  ): Promise<OptimizationResult> {
    // REQUIREMENT: Use GlueX Yields API to identify highest yield
    const opportunities = await this.fetchYieldOpportunities();
    const bestOpportunity = this.findBestYieldOpportunity(opportunities, riskTolerance);

    const yieldImprovement = bestOpportunity.apy - currentYield;
    const reallocationNeeded = yieldImprovement > 0.5; // 0.5% minimum improvement

    let transactions: TransactionStep[] = [];
    let reasoning = `Current yield: ${currentYield.toFixed(2)}%. Best GlueX opportunity: ${bestOpportunity.protocol} at ${bestOpportunity.apy.toFixed(2)}%.`;

    if (reallocationNeeded && currentVault !== bestOpportunity.vault) {
      // REQUIREMENT: Use GlueX Router API to reallocate assets
      transactions = await this.generateReallocationTransactions(
        currentVault,
        bestOpportunity.vault,
        amount,
        userAddress,
      );
      reasoning += ` Reallocating for ${yieldImprovement.toFixed(2)}% yield improvement.`;
    } else {
      reasoning += " Current allocation is optimal.";
    }

    return {
      currentYield,
      bestOpportunity,
      projectedYield: bestOpportunity.apy,
      reallocationNeeded,
      transactions,
      reasoning,
    };
  }

  /**
   * Generate reallocation transactions (mock implementation)
   */
  private async generateReallocationTransactions(
    fromVault: string,
    toVault: string,
    amount: string,
    userAddress: string,
  ): Promise<TransactionStep[]> {
    const transactions: TransactionStep[] = [];

    try {
      // Try to get real GlueX router data
      const response = await fetch("/api/gluex/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
          toToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
          amount: amount,
          fromAddress: userAddress,
          slippage: 1,
        }),
      });

      if (response.ok) {
        const routeData = await response.json();
        if (routeData.route?.to) {
          transactions.push({
            type: "swap",
            from: fromVault,
            to: routeData.route.to,
            token: "ETH",
            amount: amount,
            calldata: routeData.route.data,
            gasEstimate: parseInt(routeData.route.gasLimit || "250000"),
          });
        }
      }
    } catch (error) {
      console.warn("Router API failed, using mock transactions:", error);
    }

    // Mock transactions (easily replaceable with real contract calls)
    return [
      {
        type: "withdraw",
        from: fromVault,
        token: "ETH",
        amount: amount,
        gasEstimate: 150000,
      },
      {
        type: "deposit",
        to: toVault,
        token: "ETH",
        amount: amount,
        gasEstimate: 200000,
      },
    ];
  }

  /**
   * Mock yield data including whitelisted GlueX vaults
   * REQUIREMENT: Include GlueX Vaults in whitelisted allocation targets
   */
  private getMockYieldData(token: string): YieldOpportunity[] {
    return [
      // GlueX Vaults (whitelisted per hackathon requirements)
      {
        id: "gluex-vault-1",
        protocol: "GlueX Vault Alpha",
        vault: "0xE25514992597786E07872e6C5517FE1906C0CAdD",
        token: token,
        apy: 12.5,
        tvl: 2500000,
        risk: "medium",
        strategy: "Multi-Strategy Yield",
        isGlueXVault: true,
      },
      {
        id: "gluex-vault-2",
        protocol: "GlueX Vault Beta",
        vault: "0xCdc3975df9D1cf054F44ED238Edfb708880292EA",
        token: token,
        apy: 11.8,
        tvl: 1800000,
        risk: "medium",
        strategy: "Liquidity Mining",
        isGlueXVault: true,
      },
      {
        id: "gluex-vault-3",
        protocol: "GlueX Vault Gamma",
        vault: "0x8F9291606862eEf771a97e5B71e4B98fd1Fa216a",
        token: token,
        apy: 13.2,
        tvl: 3200000,
        risk: "high",
        strategy: "Leveraged Yield",
        isGlueXVault: true,
      },
      // Other protocols for comparison
      {
        id: "aave-v3",
        protocol: "Aave V3",
        vault: "aave_v3_eth",
        token: token,
        apy: 6.2,
        tvl: 15000000,
        risk: "low",
        strategy: "Lending",
        isGlueXVault: false,
      },
      {
        id: "yearn-finance",
        protocol: "Yearn Finance",
        vault: "yearn_eth_vault",
        token: token,
        apy: 9.8,
        tvl: 5500000,
        risk: "medium",
        strategy: "Automated Yield Farming",
        isGlueXVault: false,
      },
    ];
  }

  /**
   * Get whitelisted GlueX vaults (from smart contract)
   */
  getWhitelistedGlueXVaults(): string[] {
    return [
      "0xE25514992597786E07872e6C5517FE1906C0CAdD",
      "0xCdc3975df9D1cf054F44ED238Edfb708880292EA",
      "0x8F9291606862eEf771a97e5B71e4B98fd1Fa216a",
      "0x9f75Eac57d1c6F7248bd2AEDe58C95689f3827f7",
      "0x63Cf7EE583d9954FeBF649aD1c40C97a6493b1Be",
    ];
  }

  /**
   * Mock vault status (easily replaceable with real contract calls)
   */
  async getVaultStatus(vaultAddress: string) {
    try {
      const response = await fetch(`/api/vault?address=${vaultAddress}`);
      if (response.ok) {
        const data = await response.json();
        return data.vault;
      }
    } catch (error) {
      console.warn("Vault API failed, using mock data:", error);
    }

    // Mock vault data
    return {
      address: vaultAddress,
      tvl: 1250000,
      apy: 8.5,
      totalShares: "1000000000000000000000",
      pricePerShare: "1250000000000000000",
      allocations: this.getMockYieldData("ETH")
        .filter(y => y.isGlueXVault)
        .slice(0, 3),
    };
  }
}
