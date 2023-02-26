import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
require("dotenv").config();

const CONTRACT_ADDRESS = "0x352897A49bAeBe92eDB34aF2806DDBA028b5F995";

async function main() {
    const args = process.argv;
    const argValues = args.slice(2);
    if (argValues.length <= 0) throw new Error("Missing vote");
    if (argValues.length > 1) throw new Error("Can only cast a single vote");

    const vote = parseInt(argValues[0]);
    if (!Number.isInteger(vote)) throw new Error("Vote must be an integer");
    console.log("Vote is: ", vote);

    const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_API_KEY);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) throw new Error("Missing environment: Mnemonic seed");
    const wallet = new ethers.Wallet(privateKey);
    console.log(`Connected to the wallet address ${wallet.address}`);

    const signer = wallet.connect(provider);

    // 1: Attach Contract
    const ballotCF = new Ballot__factory(signer);
    console.log("Attaching to contract ...");
    const ballotC = ballotCF.attach(CONTRACT_ADDRESS);
    console.log(`Attached to Ballot contract at ${ballotC.address}`);

    // 2: Verify the Proposal exists
    const proposal = await ballotC.proposals(vote);
    console.log(`Proposal being voted on: ${proposal}`);

    // 3: Cast the vote
    const TxReceipt = await ballotC.connect(signer).vote(vote);
    console.log(TxReceipt);

    console.log("Vote has been cast!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
