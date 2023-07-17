require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{version: "0.8.8"}, {version: "0.6.6"}]
  },

  defaultNetwork: "hardhat",

  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPCURL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    },
    goerli: {
      url: process.env.GOERLI_RPCURL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6
    }
  },
  gasReporter: {
    enabled: true,
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API,
    currency: "USD",
    outputFile: "gas-report.txt"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
