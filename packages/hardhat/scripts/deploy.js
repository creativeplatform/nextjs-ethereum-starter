const { ethers } = require("hardhat");

async function main() {
    try {
        const creativeFactory = await ethers.getContractFactory(
            "Creative",
        );

        console.log("Deploying Creative Contract");
        const creativeDeployTxn =
            await creativeFactory.deploy(
                process.env.HOST || "",
                process.env.CFA || "",
                process.env.IDA || "",
                process.env.STREAM_ADDRESS|| "",
                process.env.RECEIVER_ADDRESS || "",
            );

        console.log("CONTRACT DEPLOYED AT:", creativeDeployTxn.address);

        console.log("Awaiting 6 confirmations before verification...");
        await creativeDeployTxn.deployTransaction.wait(6);

        console.log(
            "Creative Address:",
            creativeDeployTxn.address,
        );

    } catch (err) {
        console.error(err);
    }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
