const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  before(async() => {
    const nftMarketplaceContractFactory = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplaceContract = await nftMarketplaceContractFactory.deploy();
    await nftMarketplaceContract.deployed();
    marketplaceAddress = nftMarketplaceContract.address;

    const nftContractFactory = await ethers.getContractFactory("NFT");
    nftContract = await nftContractFactory.deploy(marketplaceAddress);
    await nftContract.deployed();
    nftAddress = nftContract.address;
  });

  it("List NFTs and perform a sell", async function () {
    let listingFee = await nftMarketplaceContract.getListingFee();
    listingFee = listingFee.toString()
    const itemPrice = ethers.utils.parseUnits('2', 'ether');
    expect(listingFee).equals("10000000000000000");

    allCollections = await nftMarketplaceContract.getAllNFTCollections();
    expect(allCollections).to.deep.equal([]);

    expect(await nftMarketplaceContract.getAllNFTCollectionsRaw()).equals("[]");
    await nftMarketplaceContract.createNFTCollection("collection 1");
    expect(await nftMarketplaceContract.getAllNFTCollectionsRaw()).equals("[{\"name\":\"collection 1\",\"collectionID\":1}]");
    await nftMarketplaceContract.createNFTCollection("collection 2");
    expect(await nftMarketplaceContract.getAllNFTCollectionsRaw()).equals("[{\"name\":\"collection 1\",\"collectionID\":1},{\"name\":\"collection 2\",\"collectionID\":2}]");

    collection1 = await nftMarketplaceContract.getNFTCollection(1);
    expect(collection1.name).equals("collection 1");
    expect(collection1.collectionID).equals(1);

    collection2 = await nftMarketplaceContract.getNFTCollection(2);
    expect(collection2.name).equals("collection 2");
    expect(collection2.collectionID).equals(2);

    allCollections = await nftMarketplaceContract.getAllNFTCollections();
    expect(allCollections[0].name).equals("collection 1");
    expect(allCollections[0].collectionID).equals(1);
    expect(allCollections[1].name).equals("collection 2");
    expect(allCollections[1].collectionID).equals(2);

    const [owner, seller, buyer] = await ethers.getSigners();

    await nftContract.connect(seller).createToken("wc:token-uri-1");
    await nftContract.connect(seller).createToken("wc:token-uri-2");
    await nftContract.connect(seller).createToken("wc:token-uri-3");

    rawItems = await nftContract.connect(seller).getUnlistedNFTItems();
    expect(rawItems[0].tokenURI).equals("wc:token-uri-1");
    expect(rawItems[0].wasListed).equals(false);
    expect(rawItems[1].tokenURI).equals("wc:token-uri-2");
    expect(rawItems[1].wasListed).equals(false);
    expect(rawItems[2].tokenURI).equals("wc:token-uri-3");
    expect(rawItems[2].wasListed).equals(false);

    await nftMarketplaceContract.connect(seller).createNFTItem(nftAddress, 1, itemPrice, 1, { value: listingFee })
    rawItems = await nftContract.connect(seller).getUnlistedNFTItems();
    expect(rawItems[0].tokenURI).equals("wc:token-uri-1");
    expect(rawItems[0].wasListed).equals(true);
    expect(rawItems[1].tokenURI).equals("wc:token-uri-2");
    expect(rawItems[1].wasListed).equals(false);
    expect(rawItems[2].tokenURI).equals("wc:token-uri-3");
    expect(rawItems[2].wasListed).equals(false);

    await nftMarketplaceContract.connect(seller).createNFTItem(nftAddress, 2, itemPrice, 2, { value: listingFee })
    rawItems = await nftContract.connect(seller).getUnlistedNFTItems();
    expect(rawItems[0].tokenURI).equals("wc:token-uri-1");
    expect(rawItems[0].wasListed).equals(true);
    expect(rawItems[1].tokenURI).equals("wc:token-uri-2");
    expect(rawItems[1].wasListed).equals(true);
    expect(rawItems[2].tokenURI).equals("wc:token-uri-3");
    expect(rawItems[2].wasListed).equals(false);

    await nftMarketplaceContract.connect(seller).createNFTItem(nftAddress, 3, itemPrice, 2, { value: listingFee })
    rawItems = await nftContract.connect(seller).getUnlistedNFTItems();
    expect(rawItems[0].tokenURI).equals("wc:token-uri-1");
    expect(rawItems[0].wasListed).equals(true);
    expect(rawItems[1].tokenURI).equals("wc:token-uri-2");
    expect(rawItems[1].wasListed).equals(true);
    expect(rawItems[2].tokenURI).equals("wc:token-uri-3");
    expect(rawItems[2].wasListed).equals(true);

    var itemsUnlisted1 = "[]"
    expect(await nftContract.connect(owner).getUnlistedNFTItemsRaw()).equals(itemsUnlisted1);
    var itemsUnlisted2 = "[{\"tokenURI\":\"wc:token-uri-1\",\"tokenID\":1,\"wasListed\":true},{\"tokenURI\":\"wc:token-uri-2\",\"tokenID\":2,\"wasListed\":true},{\"tokenURI\":\"wc:token-uri-3\",\"tokenID\":3,\"wasListed\":true}]"
    expect(await nftContract.connect(seller).getUnlistedNFTItemsRaw()).equals(itemsUnlisted2);
    var itemsUnlisted3 = "[]"
    expect(await nftContract.connect(buyer).getUnlistedNFTItemsRaw()).equals(itemsUnlisted3);

    var itemsCol1 = "[{\"itemID\":1,\"nftContractAddress\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"tokenID\":1,\"seller\":\"0x70997970c51812dc3a010c7d01b50e0d17dc79c8\",\"owner\":\"0x0000000000000000000000000000000000000000\",\"price\":2000000000000000000,\"collectionID\":1,\"isSold\":false}]"
    expect(await nftMarketplaceContract.getNFTItemsRaw(1)).equals(itemsCol1);

    var itemsCol2 = "[{\"itemID\":2,\"nftContractAddress\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"tokenID\":2,\"seller\":\"0x70997970c51812dc3a010c7d01b50e0d17dc79c8\",\"owner\":\"0x0000000000000000000000000000000000000000\",\"price\":2000000000000000000,\"collectionID\":2,\"isSold\":false},{\"itemID\":3,\"nftContractAddress\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"tokenID\":3,\"seller\":\"0x70997970c51812dc3a010c7d01b50e0d17dc79c8\",\"owner\":\"0x0000000000000000000000000000000000000000\",\"price\":2000000000000000000,\"collectionID\":2,\"isSold\":false}]"
    expect(await nftMarketplaceContract.getNFTItemsRaw(2)).equals(itemsCol2);

    const ownerInitialBalance = await owner.getBalance();
    const sellerInitialBalance = await seller.getBalance();
    const buyerInitialBalance = await buyer.getBalance();

    var itemsColleciton1 = await nftMarketplaceContract.getNFTItems(1);

    expect(itemsColleciton1[0].nftContractAddress).equals(nftAddress);
    expect(itemsColleciton1[0].seller).equals(seller.address);
    expect(itemsColleciton1[0].owner).equals("0x0000000000000000000000000000000000000000");
    expect(itemsColleciton1[0].tokenID).equals(1);
    expect(itemsColleciton1[0].price).equals(itemPrice);
    expect(itemsColleciton1[0].collectionID).equals(1);
    expect(itemsColleciton1[0].isSold).equals(false);

    await nftMarketplaceContract.connect(buyer).buyNFTItem(nftAddress, 1, { value: itemPrice })
    itemsColleciton1 = await nftMarketplaceContract.getNFTItems(1);

    expect(itemsColleciton1[0].nftContractAddress).equals(nftAddress);
    expect(itemsColleciton1[0].seller).equals(seller.address);
    expect(itemsColleciton1[0].owner).equals(buyer.address);
    expect(itemsColleciton1[0].tokenID).equals(1);
    expect(itemsColleciton1[0].price).equals(itemPrice);
    expect(itemsColleciton1[0].collectionID).equals(1);
    expect(itemsColleciton1[0].isSold).equals(true);

    const ownerPostTransactionBalance = await owner.getBalance();
    const sellerPostTransactionBalance = await seller.getBalance();
    const buyerPostTransactionBalance = await buyer.getBalance();
    
    var itemsColleciton2 = await nftMarketplaceContract.getNFTItems(2);

    expect(itemsColleciton2[0].nftContractAddress).equals(nftAddress);
    expect(itemsColleciton2[0].seller).equals(seller.address);
    expect(itemsColleciton2[0].owner).equals("0x0000000000000000000000000000000000000000");
    expect(itemsColleciton2[0].tokenID).equals(2);
    expect(itemsColleciton2[0].price).equals(itemPrice);
    expect(itemsColleciton2[0].collectionID).equals(2);
    expect(itemsColleciton2[0].isSold).equals(false);

    expect(itemsColleciton2[1].nftContractAddress).equals(nftAddress);
    expect(itemsColleciton2[1].seller).equals(seller.address);
    expect(itemsColleciton2[1].owner).equals("0x0000000000000000000000000000000000000000");
    expect(itemsColleciton2[1].tokenID).equals(3);
    expect(itemsColleciton2[1].price).equals(itemPrice);
    expect(itemsColleciton2[1].collectionID).equals(2);
    expect(itemsColleciton2[1].isSold).equals(false);

    expect(await nftContract.tokenURI(itemsColleciton1[0].tokenID)).equals("wc:token-uri-1");
    expect(await nftContract.tokenURI(itemsColleciton2[0].tokenID)).equals("wc:token-uri-2");
    expect(await nftContract.tokenURI(itemsColleciton2[1].tokenID)).equals("wc:token-uri-3");

    var itemsCol3 = "[{\"itemID\":1,\"nftContractAddress\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"tokenID\":1,\"seller\":\"0x70997970c51812dc3a010c7d01b50e0d17dc79c8\",\"owner\":\"0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc\",\"price\":2000000000000000000,\"collectionID\":1,\"isSold\":true}]"
    expect(await nftMarketplaceContract.getNFTItemsRaw(1)).equals(itemsCol3);
  });

  it("Invalid listing price", async function () {
    let listingFee = await nftMarketplaceContract.getListingFee();
    listingFee = listingFee.toString()
    const itemPrice = ethers.utils.parseUnits('2', 'ether');
    expect(listingFee).equals("10000000000000000");
    
    const [_, seller] = await ethers.getSigners();

    await nftContract.connect(seller).createToken("wc:token-uri-3");

    listAttempt = nftMarketplaceContract.connect(seller).createNFTItem(nftAddress, 4, itemPrice, 1, { value: "0" });
    await expect(listAttempt).to.be.revertedWith('Price must be in accordance to the set fee');
  });

  it("Invalid buy amount", async function () {
    let listingFee = await nftMarketplaceContract.getListingFee();
    listingFee = listingFee.toString()
    const itemPrice = ethers.utils.parseUnits('1', 'ether');
    expect(listingFee).equals("10000000000000000");

    const [_, seller, buyer] = await ethers.getSigners();

    buyAttempt = nftMarketplaceContract.connect(buyer).buyNFTItem(nftAddress, 1, { value: itemPrice })
    await expect(buyAttempt).to.be.revertedWith('Incorrect price entered');
  });

  it("Incorrect collection retrieval", async function () {
    collectionRetrieval1 = nftMarketplaceContract.getNFTItems(5);
    await expect(collectionRetrieval1).to.be.revertedWith('Invalid Collection ID');

    collectionRetrieval2 = nftMarketplaceContract.getNFTCollection(5);
    await expect(collectionRetrieval2).to.be.revertedWith('Invalid Collection ID');

    const [_, seller] = await ethers.getSigners();

    await nftContract.connect(seller).createToken("wc:token-uri-4");

    let listingFee = await nftMarketplaceContract.getListingFee();
    listingFee = listingFee.toString()
    const itemPrice = ethers.utils.parseUnits('2', 'ether');
    createAttempt = nftMarketplaceContract.connect(seller).createNFTItem(nftAddress, 1, itemPrice, 8, { value: listingFee })
    await expect(createAttempt).to.be.revertedWith('Invalid Collection ID');
  });
});