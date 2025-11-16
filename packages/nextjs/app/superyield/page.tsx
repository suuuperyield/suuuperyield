"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { type OptimizationResult, type YieldOpportunity, YieldOptimizerService } from "~~/services/yieldOptimizer";

const SuperYield: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [optimizer] = useState(() => new YieldOptimizerService());
  const [yields, setYields] = useState<YieldOpportunity[]>([]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1.0");

  const loadYieldData = useCallback(async () => {
    try {
      const opportunities = await optimizer.fetchYieldOpportunities("ETH");
      setYields(opportunities);
    } catch (error) {
      console.error("Failed to load yield data:", error);
    }
  }, [optimizer]);

  useEffect(() => {
    loadYieldData();
  }, [loadYieldData]);

  const runOptimization = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const result = await optimizer.optimizeYield(
        "mock_current_vault",
        5.0,
        (parseFloat(depositAmount) * 1e18).toString(),
        address,
        "medium",
      );
      setOptimization(result);
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("Optimization failed. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">SuperYield</span>
            <span className="block text-lg">AI-Powered Yield Optimizer</span>
          </h1>
          <p className="text-center text-lg mt-4">Using GlueX APIs & BoringVault for secure asset custody</p>

          {!isConnected && (
            <div className="alert alert-warning mt-4">
              <span>Connect your wallet to start optimizing yields</span>
            </div>
          )}
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Yield Optimization</h2>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Deposit Amount (ETH)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="input input-bordered"
                    />
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className={`btn btn-primary ${loading ? "loading" : ""}`}
                      onClick={runOptimization}
                      disabled={!isConnected || loading}
                    >
                      Optimize Yield
                    </button>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Hackathon Requirements ✅</h2>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      ERC-7540/BoringVault for asset custody
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      GlueX Yields API for yield identification
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      GlueX Router API for asset reallocation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      GlueX Vaults in whitelisted set
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {optimization && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Optimization Results</h2>
                  <div className="alert alert-info">
                    <span>{optimization.reasoning}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stat">
                      <div className="stat-title">Current Yield</div>
                      <div className="stat-value">{optimization.currentYield.toFixed(2)}%</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Best GlueX Opportunity</div>
                      <div className="stat-value text-success">{optimization.projectedYield.toFixed(2)}%</div>
                      <div className="stat-desc">{optimization.bestOpportunity.protocol}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Improvement</div>
                      <div
                        className={`stat-value ${optimization.reallocationNeeded ? "text-success" : "text-base-content"}`}
                      >
                        +{(optimization.projectedYield - optimization.currentYield).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Available GlueX Yield Opportunities</h2>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Protocol</th>
                        <th>APY</th>
                        <th>TVL</th>
                        <th>Risk</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yields
                        .filter(y => y.isGlueXVault)
                        .map((yieldOpp, index) => (
                          <tr key={yieldOpp.id || index} className="bg-primary/10">
                            <td className="font-medium">{yieldOpp.protocol}</td>
                            <td className="text-success font-bold">{yieldOpp.apy.toFixed(2)}%</td>
                            <td>${yieldOpp.tvl.toLocaleString()}</td>
                            <td>
                              <div
                                className={`badge ${
                                  yieldOpp.risk === "low"
                                    ? "badge-success"
                                    : yieldOpp.risk === "medium"
                                      ? "badge-warning"
                                      : "badge-error"
                                }`}
                              >
                                {yieldOpp.risk}
                              </div>
                            </td>
                            <td>
                              <div className="badge badge-primary">GlueX Vault</div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperYield;
