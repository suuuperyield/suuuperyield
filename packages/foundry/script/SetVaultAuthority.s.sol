// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Auth, Authority} from "solmate/auth/Auth.sol";

interface IBoringVault {
    function setAuthority(Authority newAuthority) external;
    function authority() external view returns (Authority);
    function owner() external view returns (address);
}

/**
 * @title SetVaultAuthority
 * @notice Set the SuperYieldVault's authority to RolesAuthority
 * @dev Fixes UNAUTHORIZED error - vault needs to know about authority contract
 */
contract SetVaultAuthority is Script {
    // Deployed contract addresses
    address constant AUTHORITY = 0x86f11a6db84635f566430e7cB0224F6C4ac6a28F;
    address constant VAULT = 0x8851862f714f2984c3E3Bcfc9Fafb57D67dB6845;

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("AGENT_WALLET");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Setting SuperYieldVault authority...");
        console.log("Caller:", deployer);
        console.log("Vault:", VAULT);
        console.log("Authority:", AUTHORITY);

        IBoringVault vault = IBoringVault(VAULT);

        // Check current state
        address currentAuthority = address(vault.authority());
        address currentOwner = vault.owner();

        console.log("\nCurrent State:");
        console.log("  Vault Owner:", currentOwner);
        console.log("  Current Authority:", currentAuthority);

        vm.startBroadcast(deployerPrivateKey);

        // Set authority
        vault.setAuthority(Authority(AUTHORITY));

        console.log("\nAuthority updated!");

        vm.stopBroadcast();

        // Verify
        address newAuthority = address(vault.authority());
        console.log("\nNew Authority:", newAuthority);

        console.log("\n=================================");
        console.log("AUTHORITY SET SUCCESSFULLY");
        console.log("=================================");
        console.log("SuperYieldVault now uses RolesAuthority");
        console.log("DepositTeller can call vault.enter()");
        console.log("=================================");
    }
}
