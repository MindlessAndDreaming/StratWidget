<template>
    <b-modal id="leverCamVault" @ok="execute" >
            <form @submit="execute">
                <b-form-group
                    label="Select your Vault"
                    label-for="address-select">
                    <b-form-select @input="displayERC721AndSetSwapPath(data, {swapToMai:false})" v-model="data.addressInput" :options="vaultOptions" id="address-select">
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
                    label="Target CDR"
                    label-for="cdr-input">
                    <b-form-input v-model='data.cdrInput' id="cdr-input"></b-form-input>
                </b-form-group>
                <p>Flashloan: {{ borrowable }}</p>
                <b-form-group
                    label="PATH"
                    label-for="path">
                    <b-form-input @input="resolvePath(data)" v-model='data.path' id="path"></b-form-input>
                </b-form-group>
                <p>{{ pathInfo }}</p>
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
    import IUniswapV2Router02_abi from "/static/IUniswapV2Router02/abi.json";

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
            },
            borrowable() {
                var inverseCDR = new BigNumber(100).dividedBy(this.data.cdrInput);
                var multiplier = new BigNumber(1).dividedBy(new BigNumber(1).minus(inverseCDR));
                return new BigNumber(this.data.quantityInput).multipliedBy(multiplier).toFormat(2, BigNumber.ROUND_UP);
            }
        },
        data(){
            return {
                vaultOptions: [],
                data:{
                    quantityInput: "10",
                    vaultIDInput: "15",
                    cdrInput: "161",
                    addressInput: null,
                    description: "Lever vault with MAI (CAM)",
                    tokenData: {
                        name:"",
                        symbol:""
                    },
                    path: "",
                    pathData: [],
                    router:""
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
                var swapRouterAddress = this.data.router;
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, this.data.addressInput);
                var collateralAddress = await vault.methods.collateral().call();
                var maiAddress = await vault.methods.mai().call();

                this.requestMAIloan("quick_mai_usdt", this.borrowable);
                var backing = new BigNumber(this.data.quantityInput).multipliedBy(10 ** 18); // mai decimals 
                var loanValue = new BigNumber(this.borrowable).multipliedBy(10 ** 18); // mai decimals
                var amountToBorrow = loanValue.multipliedBy(1000).dividedToIntegerBy(995).minus(backing); // borrow fee plus buffer - amount to borrow from the vault at the end of the transaction

                var priceSourceDecimals = await this.getPriceSourceDecimals(vault);
                var price = await vault.methods.getEthPriceSource().call();
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10).pow(priceSourceDecimals));
                var calculatedCollateralIn = loanValue.dividedBy(MAIPerToken);

                var swapRouterContract = new window.w3.eth.Contract(IUniswapV2Router02_abi, swapRouterAddress);
                var amountsOut = await swapRouterContract.methods.getAmountsOut(loanValue, this.splitAndTrim(this.data.path)).call();
                var baseCollateralExpected = amountsOut[amountsOut.length - 1];
                var minBaseCollateralIn = new BigNumber(baseCollateralExpected).dividedToIntegerBy(1.015); // 1.5% slippage 

                var process = await this.processTokenToCamToken(collateralAddress, minBaseCollateralIn);
                console.log(JSON.stringify(process)); 
                var tokensToDeposit = process.camTokens;

                if(calculatedCollateralIn.isGreaterThan(new BigNumber(tokensToDeposit).times(1.05))) {
                     alert("You might suffer a large slippage ( > 5%), most probably this is an issue in the path");
                }
                
                await this.callSwap(
                    swapRouterAddress,
                    loanValue,
                    maiAddress,
                    minBaseCollateralIn,
                    this.splitAndTrim(this.data.path)
                );

                await this.callTokenToCamToken(
                    process.AaveLendingPool, 
                    minBaseCollateralIn, 
                    process.underlyingAssetAddress,
                    collateralAddress,
                    process.ATokenAddress
                );

                await this.callDepositCollateral(
                    this.data.addressInput, 
                    this.data.vaultIDInput, 
                    collateralAddress, 
                    tokensToDeposit
                );

                await this.callBorrowToken(
                    this.data.addressInput, 
                    this.data.vaultIDInput, 
                    amountToBorrow
                );

                this.afterProcessing();

            }
        }
    }
</script>
