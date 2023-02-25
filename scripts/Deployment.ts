import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
require('dotenv').config();

// Helper function to convert string to bytes
function formatBytes32String(arr: string | any[]) {
    let bytesArr = [];
    for(let i = 0; i < arr.length; i++) {
        bytesArr.push(ethers.utils.formatBytes32String(arr[i]));
    }
    return bytesArr;
}

async function main() {
    const args = process.argv;
    const proposals = args.slice(2);
    if(proposals.length <= 0) throw new Error("Missing proposals")

    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal No.${index + 1}: ${element}`);
    });

    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.ALCHEMY_API_KEY
    );

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) throw new Error("Missing environment: Mnemonic seed");
    const wallet = new ethers.Wallet(privateKey);
    console.log(`Connected to the wallet address ${wallet.address}`);

    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Wallet balance: ${balance} Wei`);

    // 1: Deploy Contract
    const ballotCF = new Ballot__factory(signer);
    console.log("Deploying contract ...");
    const ballotC = await ballotCF.deploy(formatBytes32String(proposals));
    const deployTxReceipt = await ballotC.deployTransaction.wait();
    console.log(`The Ballot contract was deployed at the address ${ballotC.address}`);
    console.log({ deployTxReceipt });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});