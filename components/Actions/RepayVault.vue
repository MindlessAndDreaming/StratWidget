<template>
    <b-modal id="repayVault" @ok="execute" >
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
    import IERC20stablecoin_abi from "/static/IERC20Stablecoin/abi.json";
    import IERC20_abi from "/static/IERC20/abi.json";
    import IERC721_abi from "/static/IERC721/abi.json";

    export default {
        mixins: [global, swap],
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
                vaultOptions:[],
                data:{
                    quantityInput: "10",
                    vaultIDInput: "72",
                    addressInput: "",
                    description: "Repay vault with MAI",
                    tokenData: {
                        name:"",
                        symbol:""
                    },
                    path: "",
                    pathData: [],
                    router:""
                }
            };
        },watch: {
            '$store.state.myAccount.coinbase': async function(value) {
                await this.setup();
            }
        },
        methods: {
            async setup() {
                this.addVaultOptions("single", this.vaultOptions);
            },
            async execute(){
                var amountToPay;
                var swapRouter = this.data.router;
                
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, this.data.addressInput);
                var collateralAddress = await vault.methods.collateral().call();
                var collateralDecimals = await vault.methods.priceSourceDecimals().call();
                
                var collateralContract = new window.w3.eth.Contract(IERC20_abi, collateralAddress);
                var decimals = await collateralContract.methods.decimals().call();

                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(decimals));
                var vaultDebt = await vault.methods.vaultDebt(this.data.vaultIDInput).call();

                if (quantity.isLessThanOrEqualTo(0)) {
                    amountToPay = vaultDebt;
                } else {
                    amountToPay = quantity;
                }

                var loanPlatform = this.$store.state.myAccount.networkId != 137 ? "spooky_mai_usdc": "quick_mai_usdt";
                this.requestMAIloan(loanPlatform, new BigNumber(amountToPay).dividedBy(new BigNumber(10).pow(18)).toFormat(2, BigNumber.ROUND_UP));
                var totalFreeMAIWanted = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(990);

                var price = await vault.methods.getEthPriceSource().call();
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10 ** collateralDecimals));
                var tokensToSell = totalFreeMAIWanted.dividedToIntegerBy(MAIPerToken);
                var minMAINeeded = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(996);
                

                var payBackApprovalCall = this.maker("approve",["address", "uint256"],[this.data.addressInput, totalFreeMAIWanted]);
                this.makeRemoteCall( payBackApprovalCall, {addressInput: await vault.methods.mai().call(), description: "allow the vault address to pull MAI from the worker to pay back the loan"});

                var payable = new BigNumber(amountToPay).isGreaterThan(new BigNumber(vaultDebt)) ? vaultDebt : amountToPay;
                var debtToPay = new BigNumber(payable);
                var payBackCall = this.maker("payBackToken",["uint256", "uint256"],[new BigNumber(this.data.vaultIDInput), debtToPay]);
                this.makeRemoteCall( payBackCall, {addressInput: this.data.addressInput, description: "pay back MAI"});

                var withdrawForSaleCall = this.maker("withdrawCollateral",["uint256", "uint256"],[this.data.vaultIDInput, tokensToSell]);
                this.makeRemoteCall( withdrawForSaleCall, {addressInput: this.data.addressInput, description: "withdraw enough collateral to pay the flashswap"});

                this.callSwap(
                    swapRouter,
                    tokensToSell,
                    collateralAddress,
                    minMAINeeded,
                    this.splitAndTrim(this.data.path)
                );
            }
        }
    }
</script>
