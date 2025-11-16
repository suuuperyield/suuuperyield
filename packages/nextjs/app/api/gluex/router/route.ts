import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fromToken,
      toToken,
      amount,
      fromAddress,
      slippage = 1, // 1% default slippage
    } = body;

    const apiKey = process.env.GLUEX_API_KEY;
    const baseUrl = process.env.GLUEX_API_BASE_URL || "https://router.gluex.xyz";

    if (!apiKey) {
      return NextResponse.json({ error: "GlueX API key not configured" }, { status: 500 });
    }

    if (!fromToken || !toToken || !amount || !fromAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: fromToken, toToken, amount, fromAddress" },
        { status: 400 },
      );
    }

    // Get optimal route using GlueX Router API
    const response = await fetch(`${baseUrl}/v1/quote`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputToken: fromToken,
        outputToken: toToken,
        inputAmount: amount,
        userAddress: fromAddress,
        slippage: slippage * 100, // Convert to basis points
        chainID: "ethereum",
        uniquePID: process.env.GLUEX_INTEGRATOR_ID || "superyield-optimizer",
      }),
    });

    if (!response.ok) {
      throw new Error(`GlueX API error: ${response.status} ${response.statusText}`);
    }

    const routeData = await response.json();

    return NextResponse.json(
      {
        route: routeData,
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
    console.error("Error getting GlueX route:", error);
    return NextResponse.json(
      { error: "Failed to get optimal route", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const apiKey = process.env.GLUEX_API_KEY;
    const baseUrl = process.env.GLUEX_API_BASE_URL || "https://router.gluex.xyz";

    if (!apiKey) {
      return NextResponse.json({ error: "GlueX API key not configured" }, { status: 500 });
    }

    // Get supported protocols and liquidity modules
    const response = await fetch(`${baseUrl}/liquidity`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`GlueX API error: ${response.status} ${response.statusText}`);
    }

    const liquidityData = await response.json();

    // Mock supported tokens for demo
    const supportedTokens = [
      { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", name: "Ethereum" },
      { symbol: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", name: "USD Coin" },
      { symbol: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", name: "Tether USD" },
    ];

    return NextResponse.json(
      {
        supportedTokens,
        supportedProtocols: liquidityData,
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
    console.error("Error fetching GlueX router info:", error);
    return NextResponse.json(
      { error: "Failed to fetch router information", details: (error as Error).message },
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
