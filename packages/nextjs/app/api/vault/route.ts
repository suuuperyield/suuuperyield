import { NextRequest, NextResponse } from "next/server";

export interface VaultStatus {
  address: string;
  tvl: number;
  apy: number;
  totalShares: string;
  pricePerShare: string;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  allocations: Array<{
    protocol: string;
    percentage: number;
    amount: number;
    apy: number;
  }>;
  fees: {
    managementFee: number;
    performanceFee: number;
  };
  lastRebalance: number;
  nextRebalance: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("address");

    if (!vaultAddress) {
      return NextResponse.json({ error: "Vault address is required" }, { status: 400 });
    }

    // TODO: Replace with actual vault contract calls
    // This would typically involve:
    // 1. Reading from the BoringVault contract
    // 2. Getting current allocations from strategy manager
    // 3. Calculating performance metrics
    // 4. Fetching real-time APY data

    const mockVaultStatus: VaultStatus = {
      address: vaultAddress,
      tvl: 1250000, // $1.25M
      apy: 8.5, // 8.5%
      totalShares: "1000000000000000000000", // 1000 shares (18 decimals)
      pricePerShare: "1250000000000000000", // $1.25 per share
      performance: {
        daily: 0.023, // 0.023%
        weekly: 0.165, // 0.165%
        monthly: 0.708, // 0.708%
        yearly: 8.5, // 8.5%
      },
      allocations: [
        {
          protocol: "Aave",
          percentage: 35,
          amount: 437500,
          apy: 6.2,
        },
        {
          protocol: "Compound",
          percentage: 25,
          amount: 312500,
          apy: 7.1,
        },
        {
          protocol: "Yearn",
          percentage: 20,
          amount: 250000,
          apy: 9.8,
        },
        {
          protocol: "GlueX Vault",
          percentage: 20,
          amount: 250000,
          apy: 12.3,
        },
      ],
      fees: {
        managementFee: 1.0, // 1%
        performanceFee: 10.0, // 10%
      },
      lastRebalance: Date.now() - 86400000, // 24 hours ago
      nextRebalance: Date.now() + 518400000, // 6 days from now
    };

    return NextResponse.json(
      {
        vault: mockVaultStatus,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching vault status:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault status", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, vaultAddress, amount, userAddress } = body;

    if (!vaultAddress || !userAddress) {
      return NextResponse.json({ error: "Missing required parameters: vaultAddress, userAddress" }, { status: 400 });
    }

    // TODO: Implement vault actions (deposit, withdraw, etc.)
    // This would involve:
    // 1. Calling the appropriate vault contract methods
    // 2. Handling transaction preparation
    // 3. Return transaction data for frontend to execute

    let response;
    switch (action) {
      case "deposit":
        if (!amount) {
          return NextResponse.json({ error: "Amount is required for deposit" }, { status: 400 });
        }
        response = {
          action: "deposit",
          vaultAddress,
          amount,
          estimatedShares: (parseFloat(amount) * 0.8).toString(), // Mock calculation
          transactionData: {
            to: vaultAddress,
            data: "0x", // Mock transaction data
            value: amount,
          },
        };
        break;

      case "withdraw":
        if (!amount) {
          return NextResponse.json({ error: "Amount is required for withdraw" }, { status: 400 });
        }
        response = {
          action: "withdraw",
          vaultAddress,
          amount,
          estimatedTokens: (parseFloat(amount) * 1.25).toString(), // Mock calculation
          transactionData: {
            to: vaultAddress,
            data: "0x", // Mock transaction data
            value: "0",
          },
        };
        break;

      case "rebalance":
        response = {
          action: "rebalance",
          vaultAddress,
          transactionData: {
            to: vaultAddress,
            data: "0x", // Mock transaction data
            value: "0",
          },
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action. Supported: deposit, withdraw, rebalance" }, { status: 400 });
    }

    return NextResponse.json(
      {
        result: response,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Error processing vault action:", error);
    return NextResponse.json(
      { error: "Failed to process vault action", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
