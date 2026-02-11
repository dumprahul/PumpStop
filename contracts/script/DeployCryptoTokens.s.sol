// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {SyntheticToken} from "../src/SyntheticToken.sol";

/// @notice Base contract with shared deploy helper for crypto synthetic tokens.
abstract contract DeployCryptoTokensBase is Script {
    uint256 constant INITIAL_SUPPLY = 1_000_000e18;

    function _deploy(string memory name, string memory symbol, address deployer) internal {
        SyntheticToken token = new SyntheticToken(name, symbol, 18, INITIAL_SUPPLY, deployer, deployer);
        console2.log(symbol, "deployed at:", address(token));
    }
}

/// @notice Batch 1 — Sepolia: BTC, ETH, SOL, LINK, SUI, DOGE
contract DeployCryptoBatch1 is DeployCryptoTokensBase {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console2.log("Deployer:", deployer);
        vm.startBroadcast(pk);

        _deploy("Bitcoin",   "BTC",  deployer);
        _deploy("Ethereum",  "ETH",  deployer);
        _deploy("Solana",    "SOL",  deployer);
        _deploy("Chainlink", "LINK", deployer);
        _deploy("Sui",       "SUI",  deployer);
        _deploy("Dogecoin",  "DOGE", deployer);

        vm.stopBroadcast();
    }
}

/// @notice Batch 2 — Base Sepolia: XRP, AVAX, ATOM, ADA, DOT, LTC
contract DeployCryptoBatch2 is DeployCryptoTokensBase {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console2.log("Deployer:", deployer);
        vm.startBroadcast(pk);

        _deploy("XRP",       "XRP",  deployer);
        _deploy("Avalanche", "AVAX", deployer);
        _deploy("Cosmos",    "ATOM", deployer);
        _deploy("Cardano",   "ADA",  deployer);
        _deploy("Polkadot",  "DOT",  deployer);
        _deploy("Litecoin",  "LTC",  deployer);

        vm.stopBroadcast();
    }
}

/// @notice Batch 3 — Arbitrum Sepolia: ARB, OP, PEPE, WIF, BONK, SEI
contract DeployCryptoBatch3 is DeployCryptoTokensBase {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console2.log("Deployer:", deployer);
        vm.startBroadcast(pk);

        _deploy("Arbitrum",  "ARB",  deployer);
        _deploy("Optimism",  "OP",   deployer);
        _deploy("Pepe",      "PEPE", deployer);
        _deploy("dogwifhat", "WIF",  deployer);
        _deploy("Bonk",      "BONK", deployer);
        _deploy("Sei",       "SEI",  deployer);

        vm.stopBroadcast();
    }
}

/// @notice Batch 4 — Optimism Sepolia: APT, FIL, NEAR, INJ, TIA
contract DeployCryptoBatch4 is DeployCryptoTokensBase {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        console2.log("Deployer:", deployer);
        vm.startBroadcast(pk);

        _deploy("Aptos",         "APT",  deployer);
        _deploy("Filecoin",      "FIL",  deployer);
        _deploy("NEAR Protocol", "NEAR", deployer);
        _deploy("Injective",     "INJ",  deployer);
        _deploy("Celestia",      "TIA",  deployer);

        vm.stopBroadcast();
    }
}
