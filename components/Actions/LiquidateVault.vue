<template>
    <b-modal id="liquidateVault" @ok="execute" >
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
                    <b-form-input @input="displayVaultDebt(data)" v-model='data.vaultIDInput' id="vaultid-input"></b-form-input>
                </b-form-group>
                <p>{{vaultDebt}}</p>
                <p>{{vaultWithdrawableSurplus}}</p>
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
                vaultOptions:[],
                data:{
                    quantityInput: "10",
                    vaultIDInput: "",
                    addressInput: "",
                    description: "Liquidate Vault To MAI (single)",
                    tokenData: {
                        name:"",
                        symbol:""
                    },
                    vaultData:{
                        debt:0,
                        surplusValue:0
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
                this.beforeProcessing();
                var swapRouter = this.data.router;
                
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, this.data.addressInput);
                var collateralAddress = await vault.methods.collateral().call();
                var collateralDecimals = await this.getPriceSourceDecimals(vault);
                
                var vaultDebt = await vault.methods.vaultDebt(this.data.vaultIDInput).call();
                var loanPlatform = this.$store.state.myAccount.networkId != 137 ? "spooky_mai_usdc": "quick_mai_usdt";
                this.requestMAIloan(loanPlatform, new BigNumber(vaultDebt).dividedBy(new BigNumber(10).pow(18)).toFormat(2, BigNumber.ROUND_UP));
                var currentCollateral = await vault.methods.vaultCollateral(this.data.vaultIDInput).call();

                var withdrawableCollateral = new BigNumber(currentCollateral).multipliedBy(0.995).integerValue(BigNumber.ROUND_DOWN);

                var price = await vault.methods.getEthPriceSource().call();
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10).pow(collateralDecimals));
                var minMAIExpected = withdrawableCollateral.multipliedBy(MAIPerToken).multipliedBy(0.99).integerValue(BigNumber.ROUND_DOWN);
                
 
                 //payback tokens
                await this.callPayBackToken(
                    this.data.addressInput,
                    this.data.vaultIDInput,
                    vaultDebt
                );

                //withdraw collateral
                await this.callWithdrawCollateral(
                    this.data.addressInput,
                    this.data.vaultIDInput,
                    collateralAddress,
                    withdrawableCollateral
                );

                await this.callSwap(
                    swapRouter,
                    withdrawableCollateral,
                    collateralAddress,
                    minMAIExpected,
                    this.splitAndTrim(this.data.path)
                );

                var withdrawableMAI = minMAIExpected - vaultDebt;
                this.inform(`You Should Withdraw ${this.humanize(withdrawableMAI, 18)} MiMATIC`);

                this.afterProcessing();

            }
        }
    }
</script>
