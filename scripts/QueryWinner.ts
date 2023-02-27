import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
require('dotenv').config();

const CONTRACT_ADDRESS = "0x352897A49bAeBe92eDB34aF2806DDBA028b5F995"

async function main() {
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

    // 1: Attach Contract
    const ballotCF = new Ballot__factory(signer);
    console.log("Attaching to contract ...");
    const ballotC = ballotCF.attach(CONTRACT_ADDRESS);
    console.log(`Attached to Ballot contract at ${ballotC.address}`);

     // 2: Query winning proposal
    let winningName = await ballotC.winnerName();
    console.log(`winning proposal is ${ethers.utils.parseBytes32String(winningName)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});