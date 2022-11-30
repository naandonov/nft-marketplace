// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../contracts/NFT.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _nftItemIDs;
    Counters.Counter private _itemSold;
    Counters.Counter private _collectionIDs;

    mapping(uint256 => NFTItem) private _idToNFTItemMapping;
    mapping(uint256 => NFTCollection) private _idToCollectionMapping;
    mapping(uint256 => uint256) private _collectionToNFTMapping;

    address payable private _owner;
    uint256 private _listingFee = 0.01 ether; 

    constructor() {
        _owner = payable(msg.sender);
    }

    struct NFTCollection {
        string name;
        uint256 collectionID;
        Counters.Counter nftItemsSize;
        mapping(uint256 => uint256) nftItemsIndex;
    }

    struct NFTBaseCollection {
        string name;
        uint256 collectionID;
    }

    event NFTCollectionCreated (
        string name,
        uint256 collectionID
    );

    struct NFTItem {
        uint itemID;
        address nftContractAddress;
        uint256 tokenID;
        address payable seller;
        address payable owner;
        uint256 price;
        uint256 collectionID;
        bool isSold;
    }

    event NFTItemCreated (
        uint indexed itemID,
        address nftContractAddress,
        uint256 indexed tokenID,
        address seller,
        address owner,
        uint256 price,
        uint256 indexed collectionID,
        bool isSold
    );

    function getListingFee() public view returns (uint256) {
        return _listingFee;
    }

    function createNFTItem(
        address nftContractAddress, 
        uint256 tokenID,
        uint256 price,
        uint256 collectionID
    ) public payable nonReentrant {
        require(price > 0, "Item must be at least 1 wei");
        require(msg.value == _listingFee, "Price must be in accordance to the set fee");
        require(collectionID <= _collectionIDs.current(), "Invalid Collection ID");

        _nftItemIDs.increment();
        uint256 itemID = _nftItemIDs.current();
        NFTItem memory item = NFTItem(
            itemID,
            nftContractAddress,
            tokenID,
            payable(msg.sender),
            payable(address(0)),
            price,
            collectionID,
            false
        );
        _idToNFTItemMapping[itemID] = item;

        NFTCollection storage collection = _idToCollectionMapping[collectionID];
        collection.nftItemsSize.increment();
        collection.nftItemsIndex[collection.nftItemsSize.current()] = _nftItemIDs.current();

        NFT(nftContractAddress).consumeTokenID(tokenID);

        IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenID);
        emit NFTItemCreated(itemID, nftContractAddress, tokenID, msg.sender, address(0), price, collectionID, false);
    }

    function createNFTCollection(string memory name) public payable nonReentrant {
        _collectionIDs.increment();
        uint256 id = _collectionIDs.current();
        NFTCollection storage collection = _idToCollectionMapping[id];
        collection.name = name;
        collection.collectionID = id;
        emit NFTCollectionCreated(name, id);
    }

    function getNFTCollection(uint256 id) public view returns(NFTBaseCollection memory) {
        require(id <= _collectionIDs.current(), "Invalid Collection ID");
        NFTCollection storage collection = _idToCollectionMapping[id];
        return NFTBaseCollection(collection.name, collection.collectionID);
    }

    function buyNFTItem(
        address nftContractAddress,
        uint256 itemID
    ) public payable nonReentrant {
        uint price = _idToNFTItemMapping[itemID].price;
        uint tokenID = _idToNFTItemMapping[itemID].tokenID;
        require(msg.value == price, "Incorrect price entered");

        _idToNFTItemMapping[itemID].seller.transfer(msg.value);
        IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenID);
        _idToNFTItemMapping[itemID].owner = payable(msg.sender);
        _idToNFTItemMapping[itemID].isSold = true;
        payable(_owner).transfer(_listingFee);
    }

    function getNFTItems(uint256 collectionID) public view returns(NFTItem[] memory) {
        require(collectionID <= _collectionIDs.current(), "Invalid Collection ID");
        NFTCollection storage collection = _idToCollectionMapping[collectionID];
        NFTItem[] memory items = new NFTItem[](collection.nftItemsSize.current());

        for (uint256 i = 0; i < collection.nftItemsSize.current(); i++) {
            items[i] = _idToNFTItemMapping[collection.nftItemsIndex[i + 1]];
        }
        return items;
    }
}