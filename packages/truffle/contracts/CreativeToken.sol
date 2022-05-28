// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CreativeToken is ERC20 {
    constructor() ERC20("CreativeToken", "CRT") {
        _mint(msg.sender, 0);
    }

    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
