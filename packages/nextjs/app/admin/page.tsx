"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * Admin page to configure the DepositTeller contract
 * - Whitelist USDC as a supported asset
 */
export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // HyperEVM USDC address
  const USDC_ADDRESS = "0xb88339CB7199b77E23DB6E890353E22632Ba630f" as `0x${string}`;
  const MIN_DEPOSIT = BigInt(1_000_000); // 1 USDC (6 decimals)

  // Check if USDC is already supported
  const { data: isSupported } = useScaffoldReadContract({
    contractName: "DepositTeller",
    functionName: "isSupportedAsset",
    args: [USDC_ADDRESS],
  });

  const { data: minDeposit } = useScaffoldReadContract({
    contractName: "DepositTeller",
    functionName: "getMinimumDeposit",
    args: [USDC_ADDRESS],
  });

  // Write contract function
  const { writeContractAsync: addAsset } = useScaffoldWriteContract("DepositTeller");

  const handleWhitelistUSDC = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await addAsset({
        functionName: "addAsset",
        args: [USDC_ADDRESS, MIN_DEPOSIT],
      });

      setSuccess(true);
      alert("USDC successfully whitelisted!");
    } catch (error) {
      console.error("Failed to whitelist USDC:", error);
      alert(`Failed to whitelist USDC: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">SuperYield Admin Panel</h1>

      <div className="bg-base-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Asset Configuration</h2>

        <div className="space-y-4">
          <div className="bg-base-300 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">USDC Status:</span>
              {isSupported ? (
                <span className="badge badge-success">Supported ✓</span>
              ) : (
                <span className="badge badge-error">Not Supported</span>
              )}
            </div>

            <div className="text-sm opacity-70 mb-2">Address: {USDC_ADDRESS}</div>

            {isSupported && minDeposit !== undefined && (
              <div className="text-sm opacity-70">
                Minimum Deposit: {(Number(minDeposit) / 1_000_000).toFixed(2)} USDC
              </div>
            )}
          </div>

          {!isSupported && (
            <button
              onClick={handleWhitelistUSDC}
              disabled={loading || !isConnected}
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            >
              {loading ? "Whitelisting USDC..." : "Whitelist USDC"}
            </button>
          )}

          {success && (
            <div className="alert alert-success">
              <span>USDC has been successfully whitelisted! Users can now deposit USDC.</span>
            </div>
          )}

          {!isConnected && (
            <div className="alert alert-warning">
              <span>Please connect your wallet to manage assets</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Contract Information</h2>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Connected Address:</span>{" "}
            <span className="font-mono">{address || "Not connected"}</span>
          </div>
          <div>
            <span className="font-semibold">Network:</span> HyperEVM Mainnet (Chain 999)
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-warning bg-opacity-10 rounded-lg border border-warning">
        <h3 className="font-semibold text-warning mb-2">⚠️ Admin Access Required</h3>
        <p className="text-sm opacity-80">
          Only the contract owner can whitelist assets. Make sure you&apos;re connected with the wallet that deployed
          the contracts.
        </p>
      </div>
    </div>
  );
}
