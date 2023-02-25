import { ethers } from "hardhat";

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
    if(proposals.length <= 0) throw new Error("Please enter proposals")

    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal No.${index + 1}: ${element}`);
    });

    // 1: Deploy Contract
    console.log("Deploying Ballot contract");
    const ballotCF = await ethers.getContractFactory("Ballot");
    const ballotC = await ballotCF.deploy(formatBytes32String(proposals));
    await ballotC.deployTransaction.wait();
    console.log(`Contract deploy at ${ballotC.address}`);

    // Populate some local accounts for voting
    const signers = await ethers.getSigners();
    const [chairperson, voter1, voter2, voter3] = signers;

    // 2: Grant voting rights
    console.log(`Granting voting rights to ${voter1.address}, ${voter2.address} and ${voter3.address}`);
    await ballotC.giveRightToVote(voter1.address);
    await ballotC.giveRightToVote(voter2.address);
    await ballotC.giveRightToVote(voter3.address);
    console.log("Voting rights granted");

    // 3: Delegate votes
    // You need to (re)connect to the contract with the signer you wish to make the call with, otherwise it will default to signer[0] (chairperson)
    console.log(`Delegating voting rights from ${voter1.address} to ${voter2.address}`);
    await ballotC.connect(voter1).delegate(voter2.address);
    console.log("Voting rights delegated");

    // 4: Cast votes
    console.log(`${voter2.address} voting for ${proposals[0]}`);
    await ballotC.connect(voter2).vote(0);
    console.log("Voted");

    console.log(`${voter3.address} voting for ${proposals[1]}`);
    await ballotC.connect(voter3).vote(1);
    console.log("Voted")

    // 5: Query winning proposal
    let winningName = await ballotC.winnerName();
    console.log(`winning proposal is ${ethers.utils.parseBytes32String(winningName)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});