/**
 * GlueX Yields API Endpoint
 * Fetches real USDC yield opportunities from GlueX
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchUSDCYieldOpportunities } from "../../../../lib/gluex/gluexService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainID = searchParams.get("chainID") || "hyperevm";
    const amount = searchParams.get("amount") || "1000000"; // 1 USDC (6 decimals)

    console.log("[GlueX Yields] Fetching USDC opportunities for", { chainID, amount });

    const opportunities = await fetchUSDCYieldOpportunities(chainID, amount);

    return NextResponse.json(
      {
        success: true,
        opportunities,
        chainID,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("[GlueX Yields] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch yields: ${error instanceof Error ? error.message : "Unknown error"}`,
        opportunities: [],
        timestamp: Date.now(),
      },
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
