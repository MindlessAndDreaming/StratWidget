import global from "~/mixins/global.js";
import BigNumber from 'bignumber.js';

import IERC20_abi from "/static/IERC20/abi.json";

import IMooToken_abi from "/static/IMooToken/abi.json";
import IMooStrategy_abi from "/static/IMooStrategy/abi.json";
    

export default {
    mixins:[global],
    methods: {
        async processTokenToMooToken(mooTokenAddress, underlyingTokens) {
            var MooSingleContract = new window.w3.eth.Contract(IMooToken_abi, mooTokenAddress);
            var underlyingAssetAddress = await MooSingleContract.methods.want().call();
            var underlyingTokenContract = new window.w3.eth.Contract(IERC20_abi, underlyingAssetAddress);
            var strategyAddress = await MooSingleContract.methods.strategy().call();
            var strategyContract = new window.w3.eth.Contract(IMooStrategy_abi, strategyAddress);
            
            var mooTokenTotalSupply = await MooSingleContract.methods.totalSupply().call();
            var underlyingInMooTokenContract = new BigNumber(await underlyingTokenContract.methods.balanceOf(mooTokenAddress).call());
            var underlyingInMooStrategyContract = new BigNumber(await strategyContract.methods.balanceOf().call());
            var mooTokens = underlyingTokens.multipliedBy(mooTokenTotalSupply).dividedToIntegerBy(underlyingInMooTokenContract.plus(underlyingInMooStrategyContract));


            return {mooTokens, underlyingAssetAddress};
        },

        async callTokenToMooToken(
            underlyingTokens, 
            underlyingAssetAddress,
            mooTokenAddress,
        ){
            var mooTokenInfo = await this.getERC20Info(mooTokenAddress);    
            var underlyingTokenInfo = await this.getERC20Info(underlyingAssetAddress);    

            var enterMooTokenApprovalCall = this.maker("approve",["address", "uint256"],[mooTokenAddress, underlyingTokens]);
            this.makeRemoteCall( enterMooTokenApprovalCall, {addressInput: underlyingAssetAddress, description: `allow ${mooTokenInfo.name} to pull the ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} from the worker`});

            var enterMooTokenContractCall = this.maker("deposit",["uint256"],[underlyingTokens]);
            this.makeRemoteCall( enterMooTokenContractCall, {addressInput: mooTokenAddress, description: `Deposit ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} to beefy`});
        },

        async processMooTokenToToken(MooTokenAddress, MooTokens) {
             // get tokens from MooTokens
            var MooContract = new window.w3.eth.Contract(IMooToken_abi, MooTokenAddress)
            var underlyingAssetAddress = await MooContract.methods.want().call();
            var underlyingTokenContract = new window.w3.eth.Contract(IERC20_abi, underlyingAssetAddress);
            var strategyAddress = await MooContract.methods.strategy().call();
            var strategyContract = new window.w3.eth.Contract(IMooStrategy_abi, strategyAddress);
            
            var underlyingInMooTokenContract = new BigNumber(await underlyingTokenContract.methods.balanceOf(MooTokenAddress).call());
            var underlyingInMooStrategyContract = new BigNumber(await strategyContract.methods.balanceOf().call());

            var mooTokenTotalSupply = await MooContract.methods.totalSupply().call();
            var underlyingTokens = new BigNumber(MooTokens).multipliedBy(underlyingInMooTokenContract.plus(underlyingInMooStrategyContract)).dividedToIntegerBy(mooTokenTotalSupply);
                
             return {underlyingAssetAddress, underlyingTokens};
        },

        async callMooTokenToToken(
            mooTokens, 
            mooTokenAddress
        ){
            var mooTokenInfo = await this.getERC20Info(mooTokenAddress);    
            var leaveMooTokenContractCall = this.maker("withdraw",["uint256"],[mooTokens]);
            this.makeRemoteCall( leaveMooTokenContractCall, {addressInput: mooTokenAddress, description: `withdraw ${this.humanize(mooTokens, mooTokenInfo.decimals)} ${mooTokenInfo.name} from beefy`});
        },

    } 
};