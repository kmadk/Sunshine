// Imports.
const hre = require('hardhat');
const ethers = hre.ethers;

// Configuration for this deployment.
const options = { gasLimit: ethers.BigNumber.from(6000000), gasPrice: ethers.utils.parseEther('0.000000005') };


// Log the gas cost of a transaction.
async function logTransactionGas (transaction) {
    let transactionReceipt = await transaction.wait();
    let transactionGasCost = transactionReceipt.gasUsed;
    console.log(` -> Gas cost: ${transactionGasCost.toString()}`);
    return transactionGasCost;
}

// Deploy using an Ethers signer to a network.
async function main () {
    const signers = await ethers.getSigners();
    const addresses = await Promise.all(signers.map(async signer => signer.getAddress()));
    const deployer = { provider: signers[0].provider, signer: signers[0], address: addresses[0] };
    console.log(`Deploying contracts from: ${deployer.address}`);

    // Create a variable to track the total gas cost of deployment.
    let totalGasCost = ethers.utils.parseEther('0');

    // Retrieve contract artifacts and deploy them.
    const ShineToken = await ethers.getContractFactory('ShineToken')
    const ShineRewards = await ethers.getContractFactory('ShineRewards');

    // Deploy the item collection.
    console.log(` -> Deploying the item collection ...`);
    SHINEToken = await ShineToken.connect(deployer.signer).deploy();
    SHINETokenDeploy = await SHINEToken.deployed();
    SHINERewards = await ShineRewards.connect(deployer.signer).deploy(SHINEToken.address);
    SHINERewardsDeploy = await SHINERewards.deployed();
    ETHRewards = await ShineRewards.connect(deployer.signer).deploy(SHINEToken.address);
    ETHRewardsDeploy = await ETHRewards.deployed();
    SHINEETHRewards = await ShineRewards.connect(deployer.signer).deploy(SHINEToken.address);
    SHINEETHRewardsDeploy = await SHINEETHRewards.deployed();
    // set staked tokens for two pools
    await SHINERewards.connect(deployer.signer).setStakedToken(SHINEToken.address);
    await ETHRewards.connect(deployer.signer).setStakedToken('0x0000000000000000000000000000000000000000');
    console.log(`* ShineToken contract deployed to: ${SHINEToken.address}`);
    totalGasCost = totalGasCost.add(await logTransactionGas(SHINETokenDeploy.deployTransaction));
    console.log(`* SHINERewards contract deployed to: ${SHINERewards.address}`);
    totalGasCost = totalGasCost.add(await logTransactionGas(SHINERewardsDeploy.deployTransaction));
    console.log(`* ETHRewards contract deployed to: ${ETHRewards.address}`);
    totalGasCost = totalGasCost.add(await logTransactionGas(ETHRewardsDeploy.deployTransaction));
    console.log(`* ETHRewards contract deployed to: ${SHINEETHRewards.address}`);
    totalGasCost = totalGasCost.add(await logTransactionGas(SHINEETHRewardsDeploy.deployTransaction));

    // Verify the smart contract on Etherscan.
    console.log(`[$]: npx hardhat verify --network Optimistic korvan ${SHINEToken.address}`);
    console.log(`[$]: npx hardhat verify --network Optimistic korvan ${SHINERewards.address}`);
    console.log(`[$]: npx hardhat verify --network Optimistic Korvan ${ETHRewards.address}`);
    console.log(`[$]: npx hardhat verify --network Optimistic Korvan ${SHINEETHRewards.address}`);
    
    //Create the whitelist.
    console.log(` -> prepping pools...`);
    await SHINEToken.connect(deployer.signer).transfer(SHINERewards.address, '39000000000000000000000000');
    await SHINEToken.connect(deployer.signer).transfer(ETHRewards.address, '7000000000000000000000000');
    await SHINEToken.connect(deployer.signer).transfer(SHINEETHRewards.address, '49000000000000000000000000');
    /* set reward parameters for each pool with time dependance 
    // 3 month pool
    shineTransaction = await SHINERewards.connect(deployer.signer).setRewardParams('39000000000000000000000000', 2628000 * 3);
    // 1 week pool
    ethTransaction = await ETHRewards.connect(deployer.signer).setRewardParams('7000000000000000000000000', 604800);
    
    totalGasCost = totalGasCost.add(await logTransactionGas(shineTransaction));
    */
    // Output the final gas cost.
    console.log('');
    console.log(`=> Final gas cost of deployment: ${totalGasCost.toString()}`);
    
} 

// Execute the script and catch errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
