const hre = require("hardhat");
const nft = require('../artifacts/contracts/NFT.sol/NFT.json')
const nftMarketplace = require('../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json')

const goerliPrivateKey  = process.env.GOERLI_PRIVATE_KEY;
if (!goerliPrivateKey) {
  throw new Error("Please set your GOERLI API key in a .env file");
}

const infuraGoerliURL = process.env.INFURA_GOERLI_URL;
if (!infuraGoerliURL) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const nftContractAddress = "0x4602e25A5Dfe6C175f08c14F6801039655377aa9";
const nftMarketplaceContractAddress = "0xF2c5bF61d41fe30a7DE693E0E86174642fF9c9ab";

const run = async function() {
    const provider = new hre.ethers.providers.JsonRpcProvider(infuraGoerliURL)
    const wallet = new hre.ethers.Wallet(goerliPrivateKey, provider);
    const nftContract = new hre.ethers.Contract(nftContractAddress, nft.abi, wallet);
    const nftMarketplaceContract = new hre.ethers.Contract(nftMarketplaceContractAddress, nftMarketplace.abi, wallet)
  
    // const createCol1Tx = await nftMarketplaceContract.createNFTCollection("Bleak");
    // await createCol1Tx.wait();

    // const addCol1 = nftMarketplaceContract.createNFTCollection
    // console.log(await nftMarketplaceContract.getAllNFTCollections())
  }
  
  run()