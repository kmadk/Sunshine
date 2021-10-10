const { ethers } = require('hardhat');
const { should } = require('chai/register-should');


describe('ShineRewards', function () {
	let ShineToken, ShineRewards, ERC20;
    let SHINEToken;
    let SHINERewards;
    let ETHRewards;
    let deployer;
    let alice, bob;
    before(async () => {
        const signers = await ethers.getSigners();
		const addresses = await Promise.all(signers.map(async signer => signer.getAddress()));
		deployer = { provider: signers[0].provider, signer: signers[0], address: addresses[0] };
        alice = { provider: signers[0].provider, signer: signers[1], address: addresses[1] }
		bob = { provider: signers[2].provider, signer: signers[2], address: addresses[2] };
        // Create factories for deploying all required contracts using specified signers.
        ShineToken = await ethers.getContractFactory('ShineToken');
        ShineRewards = await ethers.getContractFactory('ShineRewards');
        ERC20 = await ethers.getContractFactory('ERC20');
    });

    beforeEach(async () => {
        SHINEToken = await ShineToken.connect(deployer.signer).deploy();
        await SHINEToken.deployed();
		// deploy two rewards pools
        SHINERewards = await ShineRewards.connect(deployer.signer).deploy(SHINEToken.address);
        await SHINERewards.deployed();
        ETHRewards = await ShineRewards.connect(deployer.signer).deploy(SHINEToken.address);
        await ETHRewards.deployed();
		// set staked tokens
		await SHINERewards.connect(deployer.signer).setStakedToken(SHINEToken.address);
		await ETHRewards.connect(deployer.signer).setStakedToken('0x0000000000000000000000000000000000000000');
		
    });

	it('check balances', async () => {
		// check deployer has total supply intially
        ((await SHINEToken.balanceOf(deployer.address)).toString()).should.be.equal('100000000000000000000000000');
    })

    it('check balances', async () => {
		// transfer balances to each pool
		await SHINEToken.connect(deployer.signer).transfer(SHINERewards.address, '39000000000000000000000000');
		await SHINEToken.connect(deployer.signer).transfer(ETHRewards.address, '7000000000000000000000000');
		// set reward parameters for each pool with time dependance 
		// 3 month pool
		await SHINERewards.connect(deployer.signer).setRewardParams('39000000000000000000000000', 2628000 * 3);
		// 1 week pool
		await ETHRewards.connect(deployer.signer).setRewardParams('7000000000000000000000000', 604800);
		// alice and bob stake in eth pool
		await ETHRewards.connect(alice.signer).stake(0, { value: ethers.utils.parseEther("4") });
		await ETHRewards.connect(bob.signer).stake(0, { value: ethers.utils.parseEther("2") });
		// progress time  5 days so rewards can be withdrawn
		const fiveDays = 60 * 60 * 24 * 5
		await ethers.provider.send('evm_increaseTime', [fiveDays]); 
		await ethers.provider.send('evm_mine');
		// collect reward
		await ETHRewards.connect(alice.signer).getReward();
		await ETHRewards.connect(bob.signer).getReward();
		//check rewards are properly proportioned and distributed
		let aliceSHINEBalance = (await SHINEToken.balanceOf(alice.address)).toString();
		let bobSHINEBalance = (await SHINEToken.balanceOf(bob.address)).toString();
		console.log(aliceSHINEBalance);
		console.log(bobSHINEBalance);
		// increase allowances
		await SHINEToken.connect(alice.signer).approve(SHINERewards.address, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
		await SHINEToken.connect(bob.signer).approve(SHINERewards.address, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
		// alice and bob stake in SHINE pool
		await SHINERewards.connect(alice.signer).stake(aliceSHINEBalance);
		await SHINERewards.connect(bob.signer).stake(bobSHINEBalance);
		// progress time 25 days so rewards can be withdrawn
		await ethers.provider.send('evm_increaseTime', [fiveDays * 5]); 
		await ethers.provider.send('evm_mine');
		// collect reward
		await SHINERewards.connect(alice.signer).getReward();
		await SHINERewards.connect(bob.signer).getReward();
		//check rewards are properly proportioned and distributed
		aliceSHINEBalance = (await SHINEToken.balanceOf(alice.address)).toString();
		bobSHINEBalance = (await SHINEToken.balanceOf(bob.address)).toString();
		console.log(aliceSHINEBalance);
		console.log(bobSHINEBalance);
		// check eth pool rewards stopped as 25 days has passed the end of the week long pool
		await ETHRewards.connect(alice.signer).getReward();
		await ETHRewards.connect(bob.signer).getReward();
		//check rewards are properly proportioned and distributed
		aliceSHINEBalance = (await SHINEToken.balanceOf(alice.address)).toString();
		bobSHINEBalance = (await SHINEToken.balanceOf(bob.address)).toString();
		console.log(aliceSHINEBalance);
		console.log(bobSHINEBalance);
		await ETHRewards.connect(alice.signer).getReward();
		await ETHRewards.connect(bob.signer).getReward();
		// increase time again to compare
		await ethers.provider.send('evm_increaseTime', [fiveDays * 5]); 
		await ethers.provider.send('evm_mine');
		aliceSHINEBalance = (await SHINEToken.balanceOf(alice.address)).toString();
		bobSHINEBalance = (await SHINEToken.balanceOf(bob.address)).toString();
		console.log(aliceSHINEBalance);
		console.log(bobSHINEBalance);
	})

}); 
