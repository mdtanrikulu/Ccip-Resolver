import { ethers } from "hardhat";
import { ProofServiceTestContract, ProofServiceTestContract__factory } from "typechain";
/**
 * This script is used to setup the environment for the e2e tests.
 * It asumes that you've set up the local development environment for OP bedrock
 * https://community.optimism.io/docs/developers/build/dev-node/
 * */

//0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
const whale = new ethers.Wallet("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

//0x8111DfD23B99233a7ae871b7c09cCF0722847d89
const alice = new ethers.Wallet("0xfd9f3842a10eb01ccf3109d4bd1c4b165721bf8c26db5db7570c146f9fad6014");
//0x504846E80A4eE8C6Eb46ec4AD64150d3f554F6b8
const bob = new ethers.Wallet("0xb03367a9007c929dfdb33237ed31e27a3d1e62f5a69ca00bb90001d6063dda4e");

const l1Provider = new ethers.providers.StaticJsonRpcProvider("http://localhost:8545");
const l2Provider = new ethers.providers.StaticJsonRpcProvider("http://localhost:9545");

const setupEnvironment = async () => {
    //Test proof logic
    let proofServiceTestContract: ProofServiceTestContract;
    let foreignProofServiceTestContract: ProofServiceTestContract;

    const l2Whale = whale.connect(l2Provider);

    //Verifiy that the local development environment is set up correctly
    if ((await l1Provider.getNetwork()).chainId !== 900 || (await l2Provider.getNetwork()).chainId !== 901) {
        console.error("Please ensure that you're running the local development environment for OP bedrock");
        return;
    }




    const proofServiceTestContractFactory = (await ethers.getContractFactory("ProofServiceTestContract")) as ProofServiceTestContract__factory;

    proofServiceTestContract = await proofServiceTestContractFactory.connect(l2Whale).deploy();
    foreignProofServiceTestContract = await proofServiceTestContractFactory.connect(l2Whale).deploy();

    console.log(`ProofServiceTestContract deployed at ${proofServiceTestContract.address}`);
    console.log(`ForeignProofServiceTestContract deployed at ${foreignProofServiceTestContract.address}`);

    /*     //Fund alice account
        const fundTx = await l2Whale.sendTransaction({
            to: alice.address,
            value: ethers.utils.parseEther("100"),
        });
        await fundTx.wait();
    
        console.log(`${alice.address} funded with ${await l2Provider.getBalance(alice.address)}`);
        //Fund bob account
        const fundTxbob = await l2Whale.sendTransaction({
            to: bob.address,
            value: ethers.utils.parseEther("100"),
        });
    
        await fundTxbob.wait();
        console.log(`${bob.address} funded with ${await l2Provider.getBalance(bob.address)}`); */



    const prepateProofServiceTestContractBytes32 = async () => {
        await proofServiceTestContract.setBool(true)
        await proofServiceTestContract.setAddress(alice.address)
        await proofServiceTestContract.setUint256(123)
        await proofServiceTestContract.setBytes32(ethers.utils.namehash("alice.eth"));
        await proofServiceTestContract.setBytes(ethers.utils.namehash("alice.eth"));
        await proofServiceTestContract.setString("Hello from Alice");
    }
    await prepateProofServiceTestContractBytes32();
    console.log("Environment setup complete wait a few minutes until everything is set");
};


//setupEnvironment();
