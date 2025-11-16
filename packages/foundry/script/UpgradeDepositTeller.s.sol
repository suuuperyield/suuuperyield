// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DepositTeller} from "../contracts/DepositTeller.sol";
import {RolesAuthority} from "solmate/auth/authorities/RolesAuthority.sol";
import {Authority} from "solmate/auth/Auth.sol";

/**
 * @title UpgradeDepositTeller
 * @notice Deploy fixed DepositTeller that doesn't double-transfer assets
 * @dev Fixes the bug where assets were transferred twice (once directly, once in vault.enter())
 */
contract UpgradeDepositTeller is Script {
    // Existing contract addresses
    address constant AUTHORITY = 0x86f11a6db84635f566430e7cB0224F6C4ac6a28F;
    address constant VAULT = 0x8851862f714f2984c3E3Bcfc9Fafb57D67dB6845;
    address constant ACCOUNTANT = 0xf4F3b37236Dd3e0bbcDe9EAA1C6553220A30B9aE;
    address constant OLD_TELLER = 0x2f245E60EE78Acb2847D8FE1336725307C7B38Df;

    // USDC on HyperEVM
    address constant USDC = 0xb88339CB7199b77E23DB6E890353E22632Ba630f;
    uint256 constant MIN_DEPOSIT = 1_000_000; // 1 USDC

    // Role constants
    uint8 constant TELLER_ROLE = 2;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("AGENT_WALLET");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying fixed DepositTeller...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new DepositTeller
        DepositTeller newTeller = new DepositTeller(
            deployer,
            Authority(AUTHORITY),
            VAULT,
            ACCOUNTANT
        );

        console.log("\nNew DepositTeller deployed at:", address(newTeller));

        // Add USDC as supported asset
        newTeller.addAsset(USDC, MIN_DEPOSIT);
        console.log("USDC added as supported asset");

        // Grant permissions to new teller
        RolesAuthority authority = RolesAuthority(AUTHORITY);

        // Grant TELLER_ROLE capability to call vault.enter()
        authority.setRoleCapability(
            TELLER_ROLE,
            VAULT,
            bytes4(keccak256("enter(address,address,uint256,address,uint256)")),
            true
        );

        // Grant TELLER_ROLE capability to call vault.exit()
        authority.setRoleCapability(
            TELLER_ROLE,
            VAULT,
            bytes4(keccak256("exit(address,address,uint256,address,uint256)")),
            true
        );

        // Grant TELLER_ROLE to new DepositTeller contract
        authority.setUserRole(address(newTeller), TELLER_ROLE, true);

        console.log("Permissions granted to new DepositTeller");

        vm.stopBroadcast();

        console.log("\n=================================");
        console.log("UPGRADE COMPLETE");
        console.log("=================================");
        console.log("Old DepositTeller:", OLD_TELLER);
        console.log("New DepositTeller:", address(newTeller));
        console.log("=================================");
        console.log("\nUpdate your frontend to use:");
        console.log("NEXT_PUBLIC_TELLER=", address(newTeller));
    }
}
