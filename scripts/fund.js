const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)

    console.log("Funding contract...")

    const previousAmount = await ethers.provider.getBalance(fundMe.address)
    const transactionResponse = await fundMe.fund({value: ethers.utils.parseEther("0.1")})
    await transactionResponse.wait(1)
    const newAmount = await ethers.provider.getBalance(fundMe.address)
    console.log(`Funded ${(newAmount - previousAmount)/10**18} ETH`)

}




main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)})