const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)

    const withdrawableAmount = await ethers.provider.getBalance(fundMe.address)

    console.log(`Withdrawing balance: ${withdrawableAmount/10**18}`)

    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)

    console.log("Withdrawal successful!")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)})