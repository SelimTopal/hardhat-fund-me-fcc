const { networkConfig, developmentChains } = require("../helper-hardhat-config") 
/* is the same as:
const helperConfig = require("helper-hardhat-config")
const networkConfig = helperConfig.networkConfig */
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre; // or: module.exports = async({ getNamedAccounts, deployments }) => {}
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // picks the pricefeed according to the chain we're on
    // what happens when we want to test on a local server ( which doesn't have price feeds of course)? we use mocks! meaning: deploy the minimal version of a price feed we coded
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }

    // deploying main contract
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // constructor arguments of FundMe
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("---------------------------------------------------")

    //automatically verify contract if we're on a testnet and not a localnode
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    const fundMeContract = ethers.getContract("FundMe", deployer)

}

module.exports.tags = ["all", "fundme"]