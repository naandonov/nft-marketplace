const hre = require("hardhat");
const ethers = hre.ethers;

async function deployContracts() {
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  const deployerAddress = 'Deploying contracts with the account: ' + deployer.address; 
  await hre.run('print', { message: deployerAddress });

  const accountBallance = 'Account balance: ' + (await deployer.getBalance()).toString();
  await hre.run('print', { message: accountBallance });
  
  const nftMarketplace = await ethers.getContractFactory("NFTMarketplace"); 
  const nftMarketplaceContract = await nftMarketplace.deploy();
  await hre.run('print', { message: 'Waiting for NFT Marketplace deployment...' });

  await nftMarketplaceContract.deployed();

  const nftMarketplaceContractAddress = 'NFT Marketplace Contract address: ' + nftMarketplaceContract.address;
  await hre.run('print', { message: nftMarketplaceContractAddress });

  const nft = await ethers.getContractFactory("NFT"); 
  const nftContract = await nft.deploy(nftMarketplaceContract.address);
  await hre.run('print', { message: 'Waiting for NFT deployment...' });

  await nftContract.deployed();

  const nftContractAddress = 'NFT Contract address: ' + nftContract.address;
  await hre.run('print', { message: nftContractAddress });

  await hre.run('print', { message: 'Done!' });
}

module.exports = deployContracts;
