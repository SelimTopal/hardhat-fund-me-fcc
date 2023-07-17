const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args // of the contract being verified
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract is already verified!")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }