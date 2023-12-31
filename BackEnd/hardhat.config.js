require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

// GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli";
// SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia";
// PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
// ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
// COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.7",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        // sepolia: {
        //     chainId: 11155111,
        //     blockConfirmations: 1,
        //     url: SEPOLIA_RPC_URL,
        //     accounts: [PRIVATE_KEY],
        // },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    // etherscan: {
    //     apiKey: process.env.ETHERSCAN_API_KEY,
    // },
    mocha: {
        timeout: 500000,
    }
};
