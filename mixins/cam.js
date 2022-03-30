import global from "~/mixins/global.js";
import BigNumber from 'bignumber.js';

import ICamToken_abi from "/static/ICamToken/abi.json";
import IAmToken_abi from "/static/IAmToken/abi.json";

export default {
    mixins:[global],
    methods: {
        async processTokenToCamToken(CamTokenAddress, underlyingTokens) {
            // get tokens from camTokens
            var CamContract = new window.w3.eth.Contract(ICamToken_abi, CamTokenAddress);
            var ATokenAddress = await CamContract.methods.Token().call();
            var AContract = new window.w3.eth.Contract(IAmToken_abi, ATokenAddress);
            var underlyingAssetAddress = await AContract.methods.UNDERLYING_ASSET_ADDRESS().call();
            var AaveLendingPool = await CamContract.methods.LENDING_POOL().call();

            var CamTokenTotalSupply = await CamContract.methods.totalSupply().call();
            var camContractBalance = await AContract.methods.balanceOf(CamTokenAddress).call();

            var camTokens = new BigNumber(underlyingTokens).multipliedBy(CamTokenTotalSupply).dividedToIntegerBy(camContractBalance);

            return {camTokens, underlyingAssetAddress, AaveLendingPool, ATokenAddress};
        },

        async callTokenToCamToken(
            AaveLendingPool, 
            underlyingTokens, 
            underlyingAssetAddress,
            CamTokenAddress,
            ATokenAddress 
        ){
            var underlyingTokenInfo = await this.getERC20Info(underlyingAssetAddress);
            var enterATokenApprovalCall = this.maker("approve",["address", "uint256"],[AaveLendingPool, underlyingTokens]);
            this.makeRemoteCall( enterATokenApprovalCall, {addressInput: underlyingAssetAddress, description: `allow AAVE Lending pool address to pull ${underlyingTokenInfo.name} contract from the worker to deposit into AAVE`});

            var aTokenInfo = await this.getERC20Info(ATokenAddress);
            var enterATokenContractCall = this.maker("deposit",["address","uint256","address","uint16"],[underlyingAssetAddress, underlyingTokens, this.worker_address, 0]);
            this.makeRemoteCall( enterATokenContractCall, {addressInput: AaveLendingPool, description: `Enter AAVE lending pool ( ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} to ${aTokenInfo.name})`});
            
            var camTokenInfo = await this.getERC20Info(CamTokenAddress);
            var enterCamTokenApprovalCall = this.maker("approve",["address", "uint256"],[CamTokenAddress, underlyingTokens]);
            this.makeRemoteCall( enterCamTokenApprovalCall, {addressInput: ATokenAddress, description: `allow ${camTokenInfo.name} contract to pull ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${aTokenInfo.name}  from the worker`});

            var enterCamTokenContractCall = this.maker("enter",["uint256"],[underlyingTokens]);
            this.makeRemoteCall( enterCamTokenContractCall, {addressInput: CamTokenAddress, description: `enter CamToken Contract (${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${aTokenInfo.name} to ${camTokenInfo.name})`});
        },

        async processCamTokenToToken(CamAddress, CamTokens) {
             // get tokens from camTokens
             var CamContract = new window.w3.eth.Contract(ICamToken_abi, CamAddress);
             var ATokenAddress = await CamContract.methods.Token().call();
             var AContract = new window.w3.eth.Contract(IAmToken_abi, ATokenAddress);
             var underlyingAssetAddress = await AContract.methods.UNDERLYING_ASSET_ADDRESS().call();
             var AaveLendingPool = await CamContract.methods.LENDING_POOL().call();
 
             var CamTokenTotalSupply = await CamContract.methods.totalSupply().call();
             var CamContractBalance = await AContract.methods.balanceOf(CamAddress).call();
             
             var underlyingTokens = new BigNumber(CamTokens).multipliedBy(CamContractBalance).dividedToIntegerBy(CamTokenTotalSupply);
 
             return {underlyingTokens, underlyingAssetAddress, AaveLendingPool, ATokenAddress};
        },

        async callCamTokenToToken(
            AaveLendingPool, 
            camTokens, 
            camAddress,
            underlyingTokens,
            underlyingAssetAddress
        ){
            var camTokenInfo = await this.getERC20Info(camAddress);
            var underlyingTokenInfo = await this.getERC20Info(underlyingAssetAddress);

            var leaveCamTokenContractCall = this.maker("leave",["uint256"],[camTokens]);
            this.makeRemoteCall( leaveCamTokenContractCall, {addressInput: camAddress, description: `withdraw  ${this.humanize(camTokens, camTokenInfo.decimals)} ${camTokenInfo.name} from the CamContract`});

            var leaveATokenContractCall = this.maker("withdraw",["address","uint256","address"],[underlyingAssetAddress, underlyingTokens, this.worker_address]);
            this.makeRemoteCall( leaveATokenContractCall, {addressInput: AaveLendingPool, description: `withdraw ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} from Aave`});
        },

    } 
};