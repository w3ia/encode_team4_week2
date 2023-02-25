import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
require('dotenv').config();

const CONTRACT_ADDRESS = "<CONTRACT_ADDRESS_GOES_HERE>"

async function main() {
    const args = process.argv;
    const voters = args.slice(2);
    if(voters.length <= 0) throw new Error("Missing voter addresses")

    console.log("Voters: ");
    voters.forEach((element, index) => {
        console.log(`Voter No.${index + 1}: ${element}`);
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

    // 1: Attach Contract
    const ballotCF = new Ballot__factory(signer);
    console.log("Attaching to contract ...");
    const ballotC = ballotCF.attach(CONTRACT_ADDRESS);
    console.log(`Attached to Ballot contract at ${ballotC.address}`);

     // 2: Grant voting rights
    voters.forEach(async element => {
        console.log(`Granting voting rights to ${element}`);
        await ballotC.giveRightToVote(element);
    });
    console.log("Voting rights granted");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});