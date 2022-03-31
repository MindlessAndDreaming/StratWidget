import global from "~/mixins/global.js";
import BigNumber from 'bignumber.js';

import ICamToken_abi from "/static/ICamToken/abi.json";
import IAmToken_abi from "/static/IAmToken/abi.json";
import IERC20_abi from "/static/IERC20/abi.json";


export default {
    mixins:[global],
    data() {
        return {
            data: {
                vaults: {
                    "137":{
                        cam: [
                            "0x88d84a85A87ED12B8f098e8953B322fF789fCD1a", // cam wmatic vlt
                            "0x11A33631a5B5349AF3F165d2B7901A4d67e561ad", // cam weth vlt
                            "0x578375c3af7d61586c2C3A7BA87d2eEd640EFA40", // cam aave vlt
                            "0x7dda5e1a389e0c1892caf55940f5fce6588a9ae0",
                            "0xD2FE44055b5C874feE029119f70336447c8e8827",
                        ]
                    }
                }
            }, 
            cam_addresses: {
                "137" :[
                    "0x22965e296d9a0Cd0E917d6D70EF2573009F8a1bB", // cam USDC
                    "0xE6C23289Ba5A9F0Ef31b8EB36241D5c800889b7b", // cam DAI
                    "0x0470CD31C8FcC42671465880BA81D631F0B76C1D", // cam WETH
                    "0xB3911259f435b28EC072E4Ff6fF5A2C604fea0Fb", // cam USDT
                    "0x7068Ea5255cb05931EFa8026Bd04b18F3DeB8b0B", // cam WMATIC
                    "0xeA4040B21cb68afb94889cB60834b13427CFc4EB", // cam AAVE
                    "0xBa6273A78a23169e01317bd0f6338547F869E8Df", // cam WBTC
                ]
            }
        };
    },
    methods: {
        async displayUnderlying(data, {input="addressInput", output="tokenData"} = {}) {
            var info = await this.getUnderlyingAaveInfo(data[input]);
            data.underlyingAssetAddress = info.underlyingAssetAddress;
            this.displayERC20(data, {input: "underlyingAssetAddress", output });
        },

        async addCamOptions(camOptions) {
            var networkId = this.$store.state.myAccount.networkId
            var chainId = `${networkId}`;
            var addresses = this.cam_addresses[chainId];
            if (addresses != undefined) {
                addresses.map((address) => {
                    let contract = new window.w3.eth.Contract(IERC20_abi, address);
                    contract.methods.name().call((_, name) => {
                        camOptions.push({
                            text: name + " - " + address,
                            value: address
                        });
                    });
                });
            }
        },
        
        async getUnderlyingAaveInfo(CamTokenAddress) {
            var CamContract = new window.w3.eth.Contract(ICamToken_abi, CamTokenAddress);
            var ATokenAddress = await CamContract.methods.Token().call();
            var AContract = new window.w3.eth.Contract(IAmToken_abi, ATokenAddress);
            var underlyingAssetAddress = await AContract.methods.UNDERLYING_ASSET_ADDRESS().call();
            var AaveLendingPool = await CamContract.methods.LENDING_POOL().call();

            return {CamContract, ATokenAddress, AContract, underlyingAssetAddress, AaveLendingPool};
        },

        async calculateCamtokensFromTokens(underlyingAaveInfo, CamTokenAddress, underlyingTokens) {
            var CamTokenTotalSupply = await underlyingAaveInfo.CamContract.methods.totalSupply().call();
            var camContractBalance = await underlyingAaveInfo.AContract.methods.balanceOf(CamTokenAddress).call();

            return new BigNumber(underlyingTokens).multipliedBy(CamTokenTotalSupply).dividedToIntegerBy(camContractBalance);
        },

        async calculateTokensFromCamtokens(underlyingAaveInfo, CamTokenAddress, CamTokens) {
            var CamTokenTotalSupply = await underlyingAaveInfo.CamContract.methods.totalSupply().call();
            var CamContractBalance = await underlyingAaveInfo.AContract.methods.balanceOf(CamTokenAddress).call();
            
            return new BigNumber(CamTokens).multipliedBy(CamContractBalance).dividedToIntegerBy(CamTokenTotalSupply);
        },

        async processTokenToCamToken(CamTokenAddress, underlyingTokens) {
            // get tokens from camTokens
            var info = await this.getUnderlyingAaveInfo(CamTokenAddress);

            var camTokens = await this.calculateCamtokensFromTokens(info, CamTokenAddress, underlyingTokens);

            var ATokenAddress = info.ATokenAddress;
            var underlyingAssetAddress = info.underlyingAssetAddress;
            var AaveLendingPool = info.AaveLendingPool;

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
            this.makeRemoteCall( enterATokenApprovalCall, {addressInput: underlyingAssetAddress, description: `allow AAVE Lending pool address to pull ${underlyingTokenInfo.name} tokens from the worker to deposit into AAVE`});

            var aTokenInfo = await this.getERC20Info(ATokenAddress);
            var enterATokenContractCall = this.maker("deposit",["address","uint256","address","uint16"],[underlyingAssetAddress, underlyingTokens, this.worker_address, 0]);
            this.makeRemoteCall( enterATokenContractCall, {addressInput: AaveLendingPool, description: `Enter AAVE lending pool ( ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} to ${aTokenInfo.name})`});
            
            var camTokenInfo = await this.getERC20Info(CamTokenAddress);
            var enterCamTokenApprovalCall = this.maker("approve",["address", "uint256"],[CamTokenAddress, underlyingTokens]);
            this.makeRemoteCall( enterCamTokenApprovalCall, {addressInput: ATokenAddress, description: `allow ${camTokenInfo.name} Contract to pull ${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${aTokenInfo.name}  from the worker`});

            var enterCamTokenContractCall = this.maker("enter",["uint256"],[underlyingTokens]);
            this.makeRemoteCall( enterCamTokenContractCall, {addressInput: CamTokenAddress, description: `enter CamToken Contract (${this.humanize(underlyingTokens, underlyingTokenInfo.decimals)} ${aTokenInfo.name} to ${camTokenInfo.name})`});
        },

        async processCamTokenToToken(CamAddress, CamTokens) {
             // get tokens from camTokens
             var info = await this.getUnderlyingAaveInfo(CamAddress);

             var underlyingTokens = await this.calculateTokensFromCamtokens(info, CamAddress, CamTokens);

             var ATokenAddress = info.ATokenAddress;
             var underlyingAssetAddress = info.underlyingAssetAddress;
             var AaveLendingPool = info.AaveLendingPool;
 
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