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

const nftContractAddress = "0xC84C09c43442d397B6dec6Ca684928b351833725";
const nftMarketplaceContractAddress = "0xE29Caee6f089577b405061a16516b36cE1CABdB2";

const run = async function() {
    const provider = new hre.ethers.providers.JsonRpcProvider(infuraGoerliURL)
    const wallet = new hre.ethers.Wallet(goerliPrivateKey, provider);
    const nftContract = new hre.ethers.Contract(nftContractAddress, nft.abi, wallet);
    const nftMarketplaceContract = new hre.ethers.Contract(nftMarketplaceContractAddress, nftMarketplace.abi, wallet)
  
    // const createCol1Tx = await nftMarketplaceContract.createNFTCollection("Beeple");
    // await createCol1Tx.wait();

    // console.log(await nftMarketplaceContract.getAllNFTCollections())
    // console.log(await nftContract.getUnlistedNFTItemsRaw())
    console.log(await nftMarketplaceContract.getNFTItems(1))

  }
  
  run()