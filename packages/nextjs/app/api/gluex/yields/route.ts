import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "ETH";

    const apiKey = process.env.GLUEX_API_KEY;
    const baseUrl = process.env.GLUEX_API_BASE_URL || "https://yield-router.gluex.xyz";

    if (!apiKey) {
      return NextResponse.json({ error: "GlueX API key not configured" }, { status: 500 });
    }

    // Fetch yield opportunities from GlueX Yield API
    // Using the historical APY endpoint as an example
    const response = await fetch(`${baseUrl}/historical-apy`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token.toLowerCase(),
        // Add additional parameters as needed
      }),
    });

    if (!response.ok) {
      throw new Error(`GlueX API error: ${response.status} ${response.statusText}`);
    }

    const yieldData = await response.json();

    // Transform the response to match our expected format
    const yields = {
      yields: [
        {
          id: "gluex-yield-1",
          protocol: "GlueX",
          token: token,
          apy: yieldData.apy || 0,
          tvl: yieldData.tvl || 0,
          risk: "medium" as const,
          strategy: "Yield Farming",
        },
      ],
      // Add mock data for demo purposes
      additionalYields: [
        {
          id: "aave-v3",
          protocol: "Aave V3",
          token: token,
          apy: 6.2,
          tvl: 1500000,
          risk: "low" as const,
          strategy: "Lending",
        },
        {
          id: "compound-v3",
          protocol: "Compound V3",
          token: token,
          apy: 7.1,
          tvl: 800000,
          risk: "low" as const,
          strategy: "Lending",
        },
      ],
    };

    return NextResponse.json(
      {
        yields: [...yields.yields, ...yields.additionalYields],
        timestamp: Date.now(),
        network: "ethereum",
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
    console.error("Error fetching GlueX yields:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield opportunities", details: (error as Error).message },
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
