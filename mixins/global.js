import IERC20_abi from "/static/IERC20/abi.json";
import IERC721_abi from "/static/IERC721/abi.json";

import { BigNumber } from "bignumber.js";

export default {
    data(){
        return {
            spookyswap_router:"",
            spiritswap_router:"0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52",
            quickswap_router:"0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
            sushi_router_multi: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
            matic_mai: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
            matic_usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            maiAddresses : {
                "137": "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
                "250": "0xfb98b335551a418cd0737375a2ea0ded62ea213b"
            },
            flash : {
                "quick_mai_usdt": {
                    mai: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
                    other: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"    
                },
                "quick_mai_dai": {
                    mai: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
                    other: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
                },
                "spooky_mai_usdc": {
                    mai: "0xfb98b335551a418cd0737375a2ea0ded62ea213b",
                    other: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                    router: "0xF491e7B69E4244ad4002BC14e878a34207E38c29"
                }
            },
            data: {
                vaults: {
                    "137": {
                        "matic":[
                            "0xa3fa99a148fa48d14ed51d610c367c61876997f1" // mai vlt
                        ],
                        "single": [
                            "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C", // weth vlt
                            "0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72",
                            "0x98B5F32dd9670191568b661a3e847Ed764943875",
                            "0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867",
                            "0x649Aa6E6b6194250C077DF4fB37c23EE6c098513",
                            "0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1",
                            "0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433", // ghst vault
                            "0xff2c44fb819757225a176e825255a01b3b8bb051", // fxs vlt
                            "0x7CbF49E4214C7200AF986bc4aACF7bc79dd9C19a", // cxdoge vlt
                            "0x506533B9C16eE2472A6BF37cc320aE45a0a24F11",
                            "0x7d36999a69f2b99bf3fb98866cbbe47af43696c8",
                        ],
                        "vghst": [
                            "0x1f0aa72b980d65518e88841ba1da075bd43fa933" // vghst vlt
                        ],
                        "stkdao": [
                            "0x57cbf36788113237d64e46f25a88855c3dff1691"
                        ],
                        "cam": [
                            "0x88d84a85A87ED12B8f098e8953B322fF789fCD1a", // cam wmatic vlt
                            "0x11A33631a5B5349AF3F165d2B7901A4d67e561ad", // cam weth vlt
                            "0x578375c3af7d61586c2C3A7BA87d2eEd640EFA40", // cam aave vlt
                            "0x7dda5e1a389e0c1892caf55940f5fce6588a9ae0",
                            "0xD2FE44055b5C874feE029119f70336447c8e8827",
                        ]
                    },
                    "250": {
                        "single": [
                            "0x1066b8FC999c1eE94241344818486D5f944331A0",
                            "0xD939c268C49c442F037E968F045ba02f499562D4",
                            "0xE5996a2cB60eA57F03bf332b5ADC517035d8d094",
                            "0xd6488d586E8Fcd53220e4804D767F19F5C846086",
                            "0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6",
                            "0xdB09908b82499CAdb9E6108444D5042f81569bD9"
                        ],
                        "moosingle": [
                            "0x75d4ab6843593c111eeb02ff07055009c836a1ef" // moobifi
                        ]
                    }
                }
            }
        }
    },

    computed: {
        coinbase () {
            return this.$store.state.myAccount.coinbase;
        },
        networkId () {
            return this.$store.state.myAccount.networkId;
        },
        harvest_point(){
            return 200;
        },
        gas_price () {
            var gas_price = 75;
            if (this.networkId == 250){
                gas_price = 300;
            }
            return new BigNumber(gas_price).multipliedBy("1e9");
        },
        gas_amount () {
            var gas_amount = "1111111";
            return gas_amount;
        },
        worker_address () {
            return this.$store.state.myAccount.workerAddress
        },
        mai () {
            var netWorkId = this.$store.state.myAccount.networkId;
            return this.maiAddresses[netWorkId];
        },

        flashOptions() { 
            return [
                {
                    label: "polygon(matic)",
                    options : [
                        {
                            text: "MAI-USDT on QuickSwap",
                            value: this.flash.quick_mai_usdt
                        },
                        {
                            text: "MAI-DAI on QuickSwap",
                            value: this.flash.quick_mai_dai
                        },
                    ]

                },
                {
                    label: "fantom",
                    options: [
                        {
                            text: "MAI-USDC on spookyswap",
                            value: this.flash.spooky_mai_usdc
                        }
                    ]
                }
                
            ];
        },
    },
    methods: {
        async executeContractMethod(ContractMethod) {
            var fun = this;
            return ContractMethod.estimateGas({
                from: fun.coinbase
            }).then((gas) => {
                return ContractMethod.send({
                    from: fun.coinbase,
                    gasPrice: fun.gas_price,
                    gas: new BigNumber(gas).multipliedBy(1.1).integerValue()
                })
            })
        },

        async makeLocalCall(ContractMethod, data = { description: "local request", local: true, addressInput: "local" }) {
            var call = ContractMethod.send.request({
                from: this.coinbase,
                gasPrice: this.gas_price,
                gas: this.gas_amount
            });

            
            this.$nuxt.$emit("createdLocalCall", { call, data: {
                addressInput: data.addressInput,
                local: true,
                description: data.description + " (local)"
            } });
        },

        makeRemoteCall(encodedFunctionCall, data) {
            this.$nuxt.$emit("createdRemoteCall", { encodedFunctionCall, data });
        },

        requestMAIloan(source, quantity_in_eth) {
            this.requestFlashLoan({
                provider: this.flash[source],
                quantity_in_eth
            });
        },

        requestFlashLoan(loan) {
            this.$nuxt.$emit("requestedFlashLoan", {loan});
        },

        inform(message) {
            this.$nuxt.$emit("info", message);
        },

        beforeProcessing() {
            this.$nuxt.$emit("startedProcessing", true);
        },

        afterProcessing() {
            this.$nuxt.$emit("finishedProcessing", true);
        },

        maker(functionName, argTypesArray, argsArray) {
            var functionInputs = [];
            for(let i=0; i<argTypesArray.length; i++){
                functionInputs.push({
                    type: argTypesArray[i],
                    name: ""
                });
            }
            var encodedFunctionCall = window.w3.eth.abi.encodeFunctionCall({
                name: functionName,
                type: 'function',
                inputs: functionInputs,
            }, argsArray);

            return encodedFunctionCall;
        },


        async displayERC20 (data, {input="addressInput", output="tokenData"} = {}) {
            const e18 = new BigNumber("1e18");
            try {
                var token = new window.w3.eth.Contract(IERC20_abi, data[input]);
                var batch = new window.w3.BatchRequest();
                batch.add(token.methods.name().call.request(( _ , result) => { data[output].name = result; }));
                batch.add(token.methods.symbol().call.request(( _ , result) => { data[output].symbol = result; }));
                batch.add(token.methods.balanceOf(this.coinbase).call.request(( _ , result) => { 
                    data.tokenData.balance = result; 
                    data.tokenData.humanBalance = new BigNumber(result).dividedBy(e18).toFormat(5, BigNumber.ROUND_DOWN); 
                }));
                batch.execute();
            } catch (error) {
                console.log(error);
            }
            
        },

        async displayERC721 (data, {input="addressInput", output="tokenData"} = {}) {
            const e18 = new BigNumber("1e18");
            try {
                var token = new window.w3.eth.Contract(IERC20_abi, data[input]);
                var batch = new window.w3.BatchRequest();
                batch.add(token.methods.name().call.request(( _ , result) => { data[output].name = result; }));
                batch.add(token.methods.symbol().call.request(( _ , result) => { data[output].symbol = result; }));
                batch.execute();
            } catch (error) {
                console.log(error);
            }
            
        },

        async provideERC721ForTransaction(erc721Address, erc721Id, data){
            var info = await this.getERC721Info(erc721Address);
            var name = info.name;
            data.description = `Provide ${name} id: ${erc721Id} for the transaction`;
            
            var ERC721 = new window.w3.eth.Contract(IERC721_abi, erc721Address);
            var erc721approval = ERC721.methods.approve(this.worker_address, erc721Id);
            this.makeLocalCall(erc721approval, data);
                
            var encodedFunctionCall = this.maker( "safeTransferFrom", ["address", "address", "uint256"], [this.coinbase, this.worker_address, erc721Id]);
            this.makeRemoteCall(encodedFunctionCall, data);
        },

        async returnERC721ToUser(erc721Address, erc721Id){
            var info = await this.getERC721Info(erc721Address);
            var name = info.name;
            var description = `Ask the worker to return ${name} id: ${erc721Id}`;
            
            var transferCall = this.maker("transferFrom",["address", "address", "uint256"],[this.worker_address, this.coinbase, erc721Id]);
            this.makeRemoteCall( transferCall, {addressInput: erc721Address, description});
        },

        async provideERC20ForTransaction(erc20Address, quantity, data) {
            var info = await this.getERC20Info(erc20Address);
            var name = info.name;
            var decimals = info.decimals;
            var quantity_in_eth = new BigNumber(quantity).dividedBy(new BigNumber(10).pow(decimals)).toFormat(6, BigNumber.ROUND_DOWN);
            data.description = `Provide about ${quantity_in_eth} ${name} for the transaction`;
            
            var Token = new window.w3.eth.Contract(IERC20_abi, erc20Address);
            var approval = Token.methods.approve(this.worker_address, quantity);
            this.makeLocalCall(approval, data);

            var encodedFunctionCall = this.maker( "transferFrom", ["address", "address", "uint256"], [this.coinbase, this.worker_address, quantity]);
            this.makeRemoteCall(encodedFunctionCall, data);
        },

        async returnERC20ToUser(erc20Address, quantity) {
            var info = await this.getERC20Info(erc20Address);
            var name = info.name;
            var decimals = info.decimals;
            var quantity_in_eth = new BigNumber(quantity).dividedBy(new BigNumber(10).pow(decimals)).toFormat(6, BigNumber.ROUND_DOWN);
            var description = `Ask The worker to return about ${quantity_in_eth} ${name} `;
            
            var transferCall = this.maker("transfer",["address", "uint256"],[this.coinbase, quantity]);
            this.makeRemoteCall( transferCall, {addressInput: erc20Address, description});
        },

        async getERC20Info(erc20Address) {
            var Token = new window.w3.eth.Contract(IERC20_abi, erc20Address);
            var name = await Token.methods.name().call();
            var decimals = await Token.methods.decimals().call();
            return {name, decimals};
        },

        async getERC721Info(erc721Address) {
            var Token = new window.w3.eth.Contract(IERC721_abi, erc721Address);
            var name = await Token.methods.name().call();
            return {name};
        },

        humanize(quantity, decimals) {
            return new BigNumber(quantity).dividedBy(new BigNumber(10).pow(decimals)).toFormat(6, BigNumber.ROUND_DOWN);
        },

        splitAndTrim(longString){
            var elements = longString.split(",");
            var cleanElements = [];
            for (let i=0; i<elements.length; i++) {
                cleanElements.push(elements[i].trim());
            }
            return cleanElements;
        }
    }
}