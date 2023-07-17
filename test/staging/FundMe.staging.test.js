const { getNamedAccounts, ethers, network, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

describe("FundMe", async function() {
        let fundMe;
        let deployer;
        const sendValue = ethers.utils.parseEther("2")

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer) // assuming it's already deployed via terminal
        })

        it("Allows people to fund and withdraw", async function(){
            await fundMe.fund({value: sendValue})
            await fundMe.withdraw()

            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })
    })