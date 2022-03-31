// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import { Withdrawable } from "./Withdrawable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";


import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";


contract Worker is Withdrawable, IUniswapV2Callee, Pausable {
    struct Action {
        address To;
        bytes Data;
    }

    struct Result {
        bool status;
        bytes Data;
    }

    struct TransactionDetails { 
        address sourceRouterAddress;
        address assetReceived;
        uint256 quantityPayable;
        Action[] actions;
    }

    function execute(Action[] memory actions )
        public
        onlyOwner
        whenNotPaused
        returns (Result[] memory)
    {
        Result[] memory results = new Result[](actions.length);

        for (uint i = 0; i < actions.length; i++) {
            (bool success, bytes memory returnData) = address(actions[i].To).call(actions[i].Data);
            require(success);
            Result memory result = Result(success, returnData); 
            results[i] = result;
        }
        return results;
    }

    function work(Action[] memory actions )
        internal
        whenNotPaused
        returns (Result[] memory)
    {
        Result[] memory results = new Result[](actions.length);

        for (uint i = 0; i < actions.length; i++) {
            (bool success, bytes memory returnData) = address(actions[i].To).call(actions[i].Data);
            require(success);
            Result memory result = Result(success, returnData); 
            results[i] = result;
        }
        return results;
    }

    function uniswapV2Call(
        address sender, 
        uint _amount0, 
        uint _amount1, 
        bytes calldata _data
    ) 
        external 
        override
        whenNotPaused() 
    {
        // msg.sender is the pair address 
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();

        TransactionDetails memory details = abi.decode(_data, (TransactionDetails));

        require(msg.sender == IUniswapV2Factory(IUniswapV2Router02(details.sourceRouterAddress).factory()).getPair(token0, token1), "Unauthorized"); 
        require(_amount0 == 0 || _amount1 == 0, "There must be a zero asset");
        require(_amount0 != 0 || _amount1 != 0, "There must be a non zero asset");
        require(sender == owner());

        work(details.actions);

        IERC20(details.assetReceived).transfer(msg.sender, details.quantityPayable);
    }
}