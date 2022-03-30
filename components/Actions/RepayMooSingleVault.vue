<template>
    <b-modal id="repayMooSingleVault" @ok="execute" >
            <form @submit="execute">
                <b-form-group
                    label="Select your Vault"
                    label-for="address-select">
                    <b-form-select @input="displayERC721AndSetSwapPath(data, {swapToMai:true})" v-model="data.addressInput" :options="vaultOptions" id="address-select">
                        <template #first>
                            <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                        </template>
                    </b-form-select>
                </b-form-group>
                <p>{{ tokenInfo }}</p>
                <b-form-group
                    label="Vault ID"
                    label-for="vaultid-input">
                    <b-form-input v-model='data.vaultIDInput' id="vaultid-input"></b-form-input>
                </b-form-group>
                <b-form-group
                    label="MAI Quantity"
                    label-for="quantity-input">
                    <b-form-input v-model='data.quantityInput' id="quantity-input"></b-form-input>
                </b-form-group>
                <b-form-group
                    label="PATH"
                    label-for="path">
                    <b-form-input @input="resolvePath(data)" v-model='data.path' id="path"></b-form-input>
                </b-form-group>
                <p> {{ pathInfo }}</p>
            </form>
        </b-modal>
</template>

<script>
    import BigNumber from 'bignumber.js';
    import global from "~/mixins/global.js";
    import swap from "~/mixins/swap.js";
    import qi from "~/mixins/qi.js";
    import IERC20stablecoin_abi from "/static/IERC20Stablecoin/abi.json";
    import IERC20_abi from "/static/IERC20/abi.json";
    import IERC721_abi from "/static/IERC721/abi.json";
    import IUniswapV2Router02_abi from "/static/IUniswapV2Router02/abi.json";


    export default {
        mixins: [global, swap, qi],
        computed: {
            tokenInfo() {
                if(this.data.tokenData.name !== "") {
                    return this.data.tokenData.name + " | " + this.data.tokenData.symbol 
                } else {
                    return "";
                }
            },
            pathInfo() {
                if(this.data.path !== "") {
                    return this.data.pathData.join(" > "); 
                } else {
                    return "";
                }
            }
        },
        data(){
            return {
                vaultOptions: [],
                data:{
                    quantityInput: "10",
                    vaultIDInput: "397",
                    addressInput: "",
                    description: "Repay Moo Single vault with MAI",
                    tokenData: {
                        name:"",
                        symbol:""
                    },
                    path: "",
                    pathData: [],
                    router: ""
                }
            };
        },
        watch: {
            '$store.state.myAccount.coinbase': async function(value) {
                await this.setup();
            }
        },
        methods: {
            async setup() {
                this.addVaultOptions("moosingle", this.vaultOptions);
            },
            async execute(){
                this.beforeProcessing();
                var amountToPay;
                var swapRouter = this.data.router;
                
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, this.data.addressInput);
                var collateralAddress = await vault.methods.collateral().call();
                var collateral = new window.w3.eth.Contract(IERC20_abi, collateralAddress);
                

                var decimals = await collateral.methods.decimals().call();
                var priceSourceDecimals = await vault.methods.priceSourceDecimals().call();

                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(decimals));
                var vaultDebt = await vault.methods.vaultDebt(this.data.vaultIDInput).call(); 

                if (quantity.isLessThanOrEqualTo(0)) {
                    amountToPay = vaultDebt;
                } else {
                    amountToPay = quantity;
                }

                this.requestMAIloan("spooky_mai_usdc", new BigNumber(amountToPay).dividedBy(new BigNumber(10).pow(18)).toFormat(2, BigNumber.ROUND_UP));
                var totalFreeMAIWanted = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(950);

                var price = await vault.methods.getEthPriceSource().call();
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10 ** priceSourceDecimals));
                var tokensToWithdraw = totalFreeMAIWanted.dividedToIntegerBy(MAIPerToken);
                var minMAINeeded = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(995);
                
                var process = await this.processMooTokenToToken(collateralAddress, tokensToWithdraw);
                var tokensReceived = new BigNumber(process.underlyingTokens).dividedToIntegerBy(1.01);

                var payable = new BigNumber(amountToPay).isGreaterThan(new BigNumber(vaultDebt)) ? vaultDebt : amountToPay;
                var debtToPay = new BigNumber(payable);

                //payback tokens
                await this.callPayBackToken(
                    this.data.addressInput,
                    this.data.vaultIDInput,
                    debtToPay
                );

                //withdraw collateral
                await this.callWithdrawCollateral(
                    this.data.addressInput,
                    this.data.vaultIDInput,
                    collateralAddress,
                    tokensToWithdraw
                );

                await this.callMooTokenToToken(
                    tokensToWithdraw,
                    collateralAddress
                );

                await this.callSwap(
                    swapRouter,
                    tokensReceived,
                    process.underlyingAssetAddress,
                    minMAINeeded,
                    this.splitAndTrim(this.data.path)
                );

                this.afterProcessing();

            }
        }
    }
</script>
