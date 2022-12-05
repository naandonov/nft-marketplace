// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
 
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    Counters.Counter private _consumedTokensSize;
    address _marketplaceAddress;

    mapping (uint256 => string) private _indexToURI;
    mapping (address => mapping ( uint256 => uint256)) private _addressToNFTItems;
    mapping (address => Counters.Counter) private _nftsPerOwner;
    uint256[] private consumedTokenIDs;

    constructor(address marketplaceAddress) ERC721("Pandamonium Tokens", "PAN") {
        _marketplaceAddress = marketplaceAddress;
    }

    struct RawNFTItem {
        string tokenURI;
        bool wasListed;
    }

    event TokenCreated(uint256 tokenID, address owner);

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIDs.increment();
        uint256 newTokenID = _tokenIDs.current();

        _indexToURI[newTokenID] = tokenURI;
        _nftsPerOwner[msg.sender].increment();
        _addressToNFTItems[msg.sender][_nftsPerOwner[msg.sender].current()] = newTokenID;

        _mint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenURI);
        setApprovalForAll(_marketplaceAddress, true);
        emit TokenCreated(newTokenID, msg.sender);
        return newTokenID;
    } 

    function consumeTokenID(uint256 tokenID) public {
        consumedTokenIDs.push(tokenID);
        _consumedTokensSize.increment();
    }

    function getUnlistedNFTItems() public view returns(RawNFTItem[] memory) {
        mapping ( uint256 => uint256) storage items = _addressToNFTItems[msg.sender];
        Counters.Counter storage itemsCount = _nftsPerOwner[msg.sender];
        RawNFTItem[] memory nftItems = new RawNFTItem[](itemsCount.current());   

        for (uint256 i = 0; i < itemsCount.current(); i++) {
            bool wasListed = false;
            string memory tokenURI = _indexToURI[items[i + 1]];
            for(uint256 j = 0; j < _consumedTokensSize.current(); j++) {
                if (items[i + 1] == consumedTokenIDs[j]) {
                    wasListed = true;
                    break;
                }
            }
            nftItems[i] = RawNFTItem(tokenURI, wasListed);
        }
        return nftItems;
    }

      function getUnlistedNFTItemsRaw() public view returns(string memory) {
        mapping ( uint256 => uint256) storage items = _addressToNFTItems[msg.sender];
        Counters.Counter storage itemsCount = _nftsPerOwner[msg.sender];
        
        uint256 itemsSize = itemsCount.current();
        string memory output = "[";
        for (uint256 i = 0; i < itemsSize; i++) {
            bool wasListed = false;
            string memory tokenURI = _indexToURI[items[i + 1]];
            for(uint256 j = 0; j < _consumedTokensSize.current(); j++) {
                if (items[i + 1] == consumedTokenIDs[j]) {
                    wasListed = true;
                    break;
                }
            }
            string memory itemElement = string(abi.encodePacked("{\"tokenURI\":", "\"", tokenURI, "\"",
                                                                ",\"tokenID\":", Strings.toString(items[i + 1]),
                                                                ",\"wasListed\":", wasListed ? "true" : "false",                                                                                                                                                                                                                                                                                                                              
                                                                "}"));
                                                                
            output = string(abi.encodePacked(output, itemElement, i < itemsSize - 1 ? "," : ""));
        }
        output = string(abi.encodePacked(output, "]"));
        return output;
    }
}