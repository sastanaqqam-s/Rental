//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BLCToken is ERC20 {
    constructor() ERC20("BLC Token", "BLC") {}

    function mint(address _to, uint amount) external {
        _mint(_to, amount);
    }
}
