const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network} = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { hexStripZeros } = require("ethers/lib/utils");

!developmentChains.includes(network.name) ? describe.skip :

describe("FundMe", async function() {

    let fundMe, deployer, mockV3Aggregator; // so we can use it throughout the test
    const sendValue = ethers.utils.parseEther("1") // converts 1 ETH in Wei

    beforeEach(async function() {

        deployer = (await getNamedAccounts).deployer // instead of: const {deployer} = await getNamedAccounts() to ensure deployer is used throughout the test
        await deployments.fixture(["all"]) // this deploys all contracts with the tag "all"
        fundMe = await ethers.getContract("FundMe", deployer) // pulls the contract from the deployed contracts and ensures every function is called by deployer
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer) 

    })




    describe("constructor", async function() {

        it("Sets the aggregator addresses correctly", async function() {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })

    })



    describe("fund", async function() {

        it("Fails if sent ETH amount is less than minimum requirement", async function() {
            await expect(fundMe.fund()).to.be.reverted
        })

        it("Updates getAddressToAmountFunded correctly", async function(){
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to getFunder list", async function(){
            await fundMe.fund({value: sendValue})
            let funderInList = false
            for(let i = 0; i <= fundMe.getFunder.length; i++){ // goes through the list to check if deployer is an element
                if (deployer == await fundMe.getFunder(i)) { // without await it returns a promise and deployers is never equal to promises
                    funderInList = true
                    break
                }
            }
            assert.equal(funderInList, true)
        })
    })


    describe("cheaperWithdraw", async function(){

        beforeEach(async function(){
            await fundMe.fund({value: sendValue})
        })

        it("Withdraws ETH from the contract (with ***single*** funder) and transacts it to deployer's account", async function(){
            // arranging the test
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // acting the test
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const { gasUsed, effectiveGasPrice } = transactionReceipt // pulls amount of gas used and the gas price in Wei from transaction receipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // asserting
            assert.equal(endingFundMeBalance, 0)
            assert.equal(endingDeployerBalance.add(totalGasCost).toString(), startingDeployerBalance.add(startingFundMeBalance).toString())
        })

        it("Withdraws ETH from the contract (with ***multiple*** getFunder) and transact it to deployer's account", async function(){
            // arrange
            const accounts = await ethers.getSigners()
            for(let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i]) // because fundMe is connected to deployer in line 12. This is a new contract object
                await fundMeConnectedContract.fund({value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // act
            const transactionRespone = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionRespone.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // asserting
            assert.equal(endingFundMeBalance, 0)
            assert.equal(endingDeployerBalance.add(totalGasCost).toString(), startingDeployerBalance.add(startingFundMeBalance).toString())

            // does getFunder reset properly?
            await expect(fundMe.getFunder(0)).to.be.reverted

            for(let i = 1; i < 6 ; i++) { // i = 1, because accounts[0] is the deployer
                let address = accounts[i].address
                assert.equal(await fundMe.getAddressToAmountFunded(address), 0)
            }
                
        })

        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWithCustomError(attackerConnectedContract, 'FundMe__NotOwner')
        })

    })
})