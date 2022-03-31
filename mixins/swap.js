import global from "~/mixins/global.js";
import IERC20_abi from "/static/IERC20/abi.json";

export default {
    mixins:[global],
    methods: {
        async callSwap(
           swapRouterAddress, 
           tokensToSwap,
           tokenAddress,
           minimumReceived,
           pathArray,
        ){
            var token1Info = await this.getERC20Info(pathArray[0]);
            var token2Info = await this.getERC20Info(pathArray[pathArray.length-1]);
            
            var swapApprovalCall = this.maker("approve",["address", "uint256"],[swapRouterAddress, tokensToSwap]);
            this.makeRemoteCall( swapApprovalCall, {addressInput: tokenAddress, description: `allow the swap router to swap ${this.humanize(tokensToSwap, token1Info.decimals)} ${token1Info.name}`});

            var swapCall = this.maker(
                "swapExactTokensForTokens",
                ["uint256", "uint256", "address[]", "address", "uint256"],
                [tokensToSwap, minimumReceived, pathArray, this.worker_address, Math.floor(Date.now() / 1000) + 600  ]
            );
            this.makeRemoteCall( swapCall, {addressInput: swapRouterAddress, description: `swap ${this.humanize(tokensToSwap, token1Info.decimals)} ${token1Info.name} to at least ${this.humanize(minimumReceived, token2Info.decimals)} ${token2Info.name}`});
        },
        
        
        async displayERC721AndSetSwapPath(
            data, 
            {
                swapToMai=true, 
                erc721input="addressInput", 
                erc721output="tokenData",
                pathinput="path", 
                pathoutput="pathData",
                router="router",
                path="path"
            } = {}
        ){
            this.setSwapPath(data, {swapToMai, router, path});
            this.displayERC721(data, {input:erc721input, output:erc721output});
            this.resolvePath(data, {input:pathinput, output:pathoutput});
        },

        async resolvePath (data, {input="path", output="pathData"} = {}) {
            try {
                data[output]=[];
                var tokens = data[input].split(",");
                for (let i=0; i<tokens.length; i++){
                    var tokenAddress = tokens[i].trim();
                    var token = new window.w3.eth.Contract(IERC20_abi, tokenAddress);
                    
                    token.methods.name().call((_, result) => {
                        data[output].splice(i, 0, result);
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },

        async setSwapPath(data, {swapToMai=true, router="router", path="path"}={}){
            var paths = {
                "0xff2c44fb819757225a176e825255a01b3b8bb051": { //fxs vlt
                    router: this.sushi_router_multi,
                    path: [
                        "0x1a3acf6d19267e2d3e7f898f42803e90c9219062", // fxs
                        this.matic_usdc,
                        this.matic_mai 
                    ]
                },
                "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C": {  // matic weth vlt
                    router: this.quickswap_router,
                    path: [
                        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // matic weth 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x7CbF49E4214C7200AF986bc4aACF7bc79dd9C19a": {  // matic cxdoge_vlt
                    router: this.quickswap_router,
                    path: [
                        "0x9Bd9aD490dD3a52f096D229af4483b94D63BE618", // matic_cxdoge
                        "0xfe4546feFe124F30788c4Cc1BB9AA6907A7987F9", // matic_cxeth
                        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // matic_weth 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433": {  // matic ghst vlt
                    router: this.quickswap_router,
                    path: [
                        "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", // matic ghst 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x88d84a85A87ED12B8f098e8953B322fF789fCD1a": {  // matic cam wmatic vlt
                    router: this.quickswap_router,
                    path: [
                        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // wmatic 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x11A33631a5B5349AF3F165d2B7901A4d67e561ad": {  // matic cam weth vlt
                    router: this.quickswap_router,
                    path: [
                        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // matic weth 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x578375c3af7d61586c2C3A7BA87d2eEd640EFA40": {  // matic cam aave vlt
                    router: this.quickswap_router,
                    path: [
                        "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", // matic aave
                        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // matic weth 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x1f0aa72b980d65518e88841ba1da075bd43fa933": {  // matic vghst vlt
                    router: this.quickswap_router,
                    path: [
                        "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", // matic ghst 
                        this.matic_usdc, 
                        this.matic_mai
                    ]
                },
                "0x75d4ab6843593c111eeb02ff07055009c836a1ef": { // ftm bifi vlt
                    router: this.spiritswap_router,
                    path: [
                        "0xd6070ae98b8069de6B494332d1A1a81B6179D960", // ftm bifi
                        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // wftm
                        this.maiAddresses["250"]
                    ]
                },
            }
            
            data[router] = paths[data.addressInput].router;
            data[path] = swapToMai ? "".concat(paths[data.addressInput].path) : "".concat([...paths[data.addressInput].path].reverse())
        },
    }
};