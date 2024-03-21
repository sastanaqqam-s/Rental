// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./wrappedabstract.sol";

contract wrapped is wrappedabstract {
    function initialize(
        uint256 _endAt,
        uint256 _startAt,
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
        address owner,
        uint256 _tokenID
    ) external {
        _initialize(_name, _symbol);

        _mint(owner, _tokenID);
        _setExpireAt(_endAt);
        _setStartAt(_startAt);
        _setTokenURIWrapped(_tokenURI);
    }
}
