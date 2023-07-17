const { network } = require("hardhat")
const {developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre; // or: module.exports = async({ getNamedAccounts, deployments }) => {}
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        console.log("Local network detected, deploying mocks...")
        const V3Aggregator = await deploy("MockV3Aggregator", {
            from: deployer,
            log: true, // information about the contract
            args: [DECIMALS, INITIAL_ANSWER], // https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/MockV3Aggregator.sol @ constructor arguments
        })
        console.log("Mocks deployed!")
    }

}

module.exports.tags = ["all", "mocks"]