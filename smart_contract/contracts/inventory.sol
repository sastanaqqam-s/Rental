//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// keep track of NFt inventory

struct Inventory {
    uint256 nftID;
    address collectionAddress;
    uint256 expiresAt;
    // uint256 startAt;
    uint256 minumumDuration;
    uint256 maximumDuration;
    // bool openforrent;
    uint256 rentpersecond;
    string bestResolution;
    string aspectRatio;
    string category;
    address owner;
    uint256 rentcollected;
    // bool discountAllowed;
    // uint256[] packageIDs;
    // uint256 rentWithdrawn;
}

contract NFTInventory is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;

    mapping(uint256 => Inventory) public allNFT;
    mapping(uint256 => uint256) public rentWithdrawn;

    function add(
        uint256 _nftID,
        address _nftAddress,
        uint256 _expiresAfter,
        uint256 _minumumDuration,
        uint256 _maximumDuration,
        uint256 _rentpersecond,
        uint256 _rentcollected,
        address _owner,
        string memory _bestResolution,
        string memory _aspectRatio,
        string memory _category
    )
        external
        // uint256[] memory _packageIDs
        onlyOwner
        returns (uint256)
    {
        Inventory memory nft = Inventory({
            nftID: _nftID,
            collectionAddress: _nftAddress,
            expiresAt: _expiresAfter,
            minumumDuration: _minumumDuration,
            maximumDuration: _maximumDuration,
            rentpersecond: _rentpersecond,
            aspectRatio: _aspectRatio,
            category: _category,
            bestResolution: _bestResolution,
            owner: _owner,
            rentcollected: _rentcollected
            // packageIDs: _packageIDs
        });

        _itemIds.increment();
        allNFT[_itemIds.current()] = nft;

        return _itemIds.current();
    }

    function getLastID() external view returns (uint256) {
        return _itemIds.current();
    }

    function get(uint256 _itemID) external view returns (Inventory memory) {
        return allNFT[_itemID];
    }

    function update(
        Inventory memory inventory,
        uint256 _itemID
    ) external onlyOwner {
        allNFT[_itemID] = inventory;
    }

    function updateRentWithdrawn(
        uint256 _itemID,
        uint256 _rentWithdrawn
    ) external onlyOwner {
        rentWithdrawn[_itemID] = _rentWithdrawn;
    }

    function getRentWithdrawn(uint256 _itemID) public view returns (uint256) {
        return rentWithdrawn[_itemID];
    }
}
