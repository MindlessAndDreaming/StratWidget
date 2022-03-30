<template>
    <b-modal id="repayCamVault" @ok="execute" >
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
    import cam from "~/mixins/cam.js";
    import qi from "~/mixins/qi.js";
    import swap from "~/mixins/swap.js";

    import IERC20stablecoin_abi from "/static/IERC20Stablecoin/abi.json";
    import IERC20_abi from "/static/IERC20/abi.json";

    export default {
        mixins: [global, cam, swap, qi],
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
                    vaultIDInput: "2778",
                    addressInput: "",
                    description: "Repay CAM vault with MAI",
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
                this.addVaultOptions("cam", this.vaultOptions);
            },
            async execute(){
                this.beforeProcessing();
                var amountToPay;
                var swapRouter = this.data.router;
                
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, this.data.addressInput);
                
                var collateralAddress = await vault.methods.collateral().call();
                var collateralDecimals = await this.getPriceSourceDecimals(vault);

                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(18));
                var vaultDebt = await vault.methods.vaultDebt(this.data.vaultIDInput).call();

                if (quantity.isLessThanOrEqualTo(0)) {
                    amountToPay = vaultDebt;
                } else {
                    amountToPay = quantity;
                }
                
                this.requestMAIloan("quick_mai_usdt", new BigNumber(amountToPay).dividedBy(new BigNumber(10).pow(18)).toFormat(2, BigNumber.ROUND_UP));
                var totalFreeMAIWanted = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(950);

                var price = await vault.methods.getEthPriceSource().call();
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10).pow(collateralDecimals));
                var tokensToWithdraw = totalFreeMAIWanted.dividedToIntegerBy(MAIPerToken);
                var minMAINeeded = new BigNumber(amountToPay).times(1000).dividedToIntegerBy(995);
                
                
                var process = await this.processCamTokenToToken(collateralAddress, tokensToWithdraw);
                var tokensToSwap = process.underlyingTokens.dividedToIntegerBy(1.001);

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

                await this.callCamTokenToToken(
                    process.AaveLendingPool,
                    tokensToWithdraw,
                    collateralAddress,
                    process.underlyingTokens,
                    process.underlyingAssetAddress
                );

                await this.callSwap(
                    swapRouter,
                    tokensToSwap,
                    process.underlyingAssetAddress,
                    minMAINeeded,
                    this.splitAndTrim(this.data.path)
                );

                this.afterProcessing();

            }
        }
    }
</script>
