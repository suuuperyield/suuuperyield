// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DepositTeller} from "../contracts/DepositTeller.sol";

/**
 * @title AddUSDCAsset
 * @notice Script to whitelist USDC in the DepositTeller contract
 * @dev Calls addAsset() with HyperEVM USDC address
 */
contract AddUSDCAsset is Script {
    // HyperEVM USDC address
    address constant USDC = 0xb88339CB7199b77E23DB6E890353E22632Ba630f;

    // Deployed DepositTeller address
    address constant TELLER = 0x2f245E60EE78Acb2847D8FE1336725307C7B38Df;

    // Minimum deposit: 1 USDC (6 decimals)
    uint256 constant MIN_DEPOSIT = 1_000_000; // 1 USDC

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("AGENT_WALLET");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Adding USDC as supported asset...");
        console.log("Caller:", deployer);
        console.log("DepositTeller:", TELLER);
        console.log("USDC Address:", USDC);
        console.log("Minimum Deposit:", MIN_DEPOSIT, "(1 USDC)");

        vm.startBroadcast(deployerPrivateKey);

        DepositTeller teller = DepositTeller(TELLER);

        // Add USDC as supported asset
        teller.addAsset(USDC, MIN_DEPOSIT);

        console.log("\nUSDC successfully added as supported asset!");

        // Verify it was added
        bool isSupported = teller.isSupportedAsset(USDC);
        uint256 minDeposit = teller.getMinimumDeposit(USDC);

        console.log("\nVerification:");
        console.log("  Is USDC supported?", isSupported);
        console.log("  Minimum deposit:", minDeposit);

        vm.stopBroadcast();
    }
}
