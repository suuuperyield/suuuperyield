// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SuperYieldVault} from "../contracts/SuperYieldVault.sol";
import {StrategyManager} from "../contracts/StrategyManager.sol";
import {DepositTeller} from "../contracts/DepositTeller.sol";
import {YieldAccountant} from "../contracts/YieldAccountant.sol";
import {RolesAuthority} from "solmate/auth/authorities/RolesAuthority.sol";

/**
 * @title DeploySuperYield
 * @notice Deployment script for the SuperYield vault system
 * @dev Deploys all 4 core contracts and sets up permissions
 */
contract DeploySuperYield is Script {
    // Deployment addresses (will be populated during deployment)
    SuperYieldVault public vault;
    StrategyManager public manager;
    DepositTeller public teller;
    YieldAccountant public accountant;
    RolesAuthority public authority;

    // Configuration
    string constant VAULT_NAME = "SuperYield Vault";
    string constant VAULT_SYMBOL = "syETH";
    uint8 constant VAULT_DECIMALS = 18;

    // Role constants
    uint8 constant ADMIN_ROLE = 0;
    uint8 constant MANAGER_ROLE = 1;
    uint8 constant TELLER_ROLE = 2;

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("AGENT_DEFAULT_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying SuperYield contracts...");
        console.log("Deployer address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy RolesAuthority for access control
        console.log("\n1. Deploying RolesAuthority...");
        authority = new RolesAuthority(deployer, RolesAuthority(address(0)));
        console.log("RolesAuthority deployed at:", address(authority));

        // 2. Deploy SuperYieldVault
        console.log("\n2. Deploying SuperYieldVault...");
        vault = new SuperYieldVault(
            deployer,
            VAULT_NAME,
            VAULT_SYMBOL,
            VAULT_DECIMALS
        );
        console.log("SuperYieldVault deployed at:", address(vault));

        // 3. Deploy YieldAccountant
        console.log("\n3. Deploying YieldAccountant...");
        accountant = new YieldAccountant(
            deployer,
            authority,
            address(vault),
            VAULT_DECIMALS
        );
        console.log("YieldAccountant deployed at:", address(accountant));

        // 4. Deploy StrategyManager
        console.log("\n4. Deploying StrategyManager...");
        manager = new StrategyManager(
            deployer,
            authority,
            address(vault)
        );
        console.log("StrategyManager deployed at:", address(manager));

        // 5. Deploy DepositTeller
        console.log("\n5. Deploying DepositTeller...");
        teller = new DepositTeller(
            deployer,
            authority,
            address(vault),
            address(accountant)
        );
        console.log("DepositTeller deployed at:", address(teller));

        // 6. Set up roles and permissions
        console.log("\n6. Setting up roles and permissions...");

        // Grant MANAGER_ROLE to the StrategyManager contract
        authority.setRoleCapability(
            MANAGER_ROLE,
            address(manager),
            bytes4(keccak256("allocate(address,address,uint256)")),
            true
        );
        authority.setRoleCapability(
            MANAGER_ROLE,
            address(manager),
            bytes4(keccak256("withdraw(address,address,uint256)")),
            true
        );

        // Grant TELLER_ROLE to the DepositTeller contract
        authority.setRoleCapability(
            TELLER_ROLE,
            address(teller),
            bytes4(keccak256("deposit(address,uint256)")),
            true
        );
        authority.setRoleCapability(
            TELLER_ROLE,
            address(teller),
            bytes4(keccak256("withdraw(address,uint256)")),
            true
        );

        // Grant roles to deployer (who represents the AI agent)
        authority.setUserRole(deployer, ADMIN_ROLE, true);
        authority.setUserRole(deployer, MANAGER_ROLE, true);
        authority.setUserRole(deployer, TELLER_ROLE, true);

        console.log("Roles configured successfully");

        vm.stopBroadcast();

        // 7. Print deployment summary
        console.log("\n=================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("=================================");
        console.log("RolesAuthority:", address(authority));
        console.log("SuperYieldVault:", address(vault));
        console.log("YieldAccountant:", address(accountant));
        console.log("StrategyManager:", address(manager));
        console.log("DepositTeller:", address(teller));
        console.log("=================================");
        console.log("\nGlueX Whitelisted Vaults:");
        address[5] memory vaults = vault.getWhitelistedVaults();
        for (uint256 i = 0; i < vaults.length; i++) {
            console.log("  ", i + 1, ":", vaults[i]);
        }
        console.log("=================================");

        // 8. Save deployment addresses to file
        string memory deploymentInfo = string.concat(
            "# SuperYield Deployment Addresses\n\n",
            "## Core Contracts\n",
            "- **RolesAuthority**: `", vm.toString(address(authority)), "`\n",
            "- **SuperYieldVault**: `", vm.toString(address(vault)), "`\n",
            "- **YieldAccountant**: `", vm.toString(address(accountant)), "`\n",
            "- **StrategyManager**: `", vm.toString(address(manager)), "`\n",
            "- **DepositTeller**: `", vm.toString(address(teller)), "`\n\n",
            "## Environment Variables\n",
            "Add these to your `.env.local`:\n\n",
            "```bash\n",
            "NEXT_PUBLIC_VAULT=", vm.toString(address(vault)), "\n",
            "NEXT_PUBLIC_MANAGER=", vm.toString(address(manager)), "\n",
            "NEXT_PUBLIC_TELLER=", vm.toString(address(teller)), "\n",
            "NEXT_PUBLIC_ACCOUNTANT=", vm.toString(address(accountant)), "\n",
            "NEXT_PUBLIC_AUTHORITY=", vm.toString(address(authority)), "\n",
            "```\n\n",
            "## GlueX Whitelisted Vaults\n"
        );

        for (uint256 i = 0; i < vaults.length; i++) {
            deploymentInfo = string.concat(
                deploymentInfo,
                vm.toString(i + 1),
                ". `",
                vm.toString(vaults[i]),
                "`\n"
            );
        }

        vm.writeFile("deployments/superyield.md", deploymentInfo);
        console.log("\nDeployment info saved to: deployments/superyield.md");
    }
}
