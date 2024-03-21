// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./openzeppelin/ERC721Upgradeable.sol";

abstract contract wrappedabstract is ERC721Upgradeable, OwnableUpgradeable {
    uint256 public expireAt;
    uint256 public startAt;
    string public URI;
    string public notactiveuri = "rent not started uri";

    mapping(address => mapping(uint256 => bool)) public rental;

    function _setExpireAt(uint256 _expireAt) public {
        expireAt = _expireAt;
    }

    function _setStartAt(uint256 _startAt) public {
        startAt = _startAt;
    }

    function _setTokenURIWrapped(string memory _URI) public {
        URI = _URI;
    }

    function _initialize(
        string memory _name,
        string memory _symbol
    ) public initializer {
        __ERC721_init(_name, _symbol);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (block.timestamp > startAt && block.timestamp < expireAt) {
            return URI;
        }
        return notactiveuri;
    }

    function balanceOf(
        address owner
    ) public view virtual override returns (uint256) {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );

        if (block.timestamp > startAt && block.timestamp < expireAt) {
            //TODO returen expired uri
            // console.log("block timestamp",block.timestamp);
            return super.balanceOf(owner);
        }
        return 0;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if (block.timestamp > startAt && block.timestamp < expireAt) {
            return super.ownerOf(tokenId);
        }
        return address(0);
    }
}
