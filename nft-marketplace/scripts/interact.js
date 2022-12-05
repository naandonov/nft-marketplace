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

const nftContractAddress = "0xF30070c5481974eE2B8BC6849cD2593D1cb83423";
const nftMarketplaceContractAddress = "0x5857f727998288a562b9c65f5E5198b9EbB75135";

const run = async function() {
    const provider = new hre.ethers.providers.JsonRpcProvider(infuraGoerliURL)
    const wallet = new hre.ethers.Wallet(goerliPrivateKey, provider);
    const nftContract = new hre.ethers.Contract(nftContractAddress, nft.abi, wallet);
    const nftMarketplaceContract = new hre.ethers.Contract(nftMarketplaceContractAddress, nftMarketplace.abi, wallet)
  
    // const createCol1Tx = await nftMarketplaceContract.createNFTCollection("Steampunk");
    // await createCol1Tx.wait();
    // const createCol2Tx = await nftMarketplaceContract.createNFTCollection("Beeple");
    // await createCol2Tx.wait();
    // const createCol3Tx = await nftMarketplaceContract.createNFTCollection("Anime");
    // await createCol3Tx.wait();

    // console.log(await nftMarketplaceContract.getAllNFTCollections())
    // console.log(await nftContract.getUnlistedNFTItemsRaw())
    // console.log(await nftMarketplaceContract.getNFTItems(1))
    const z = await nftMarketplaceContract.buyNFTItem(nftContractAddress, 2, { value: 20000000000000000 });
    await z.wait();

  }
  
  run()