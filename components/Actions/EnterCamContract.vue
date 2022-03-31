<template>
    <b-modal id="enterCamContract" @ok="execute" >
        <form @submit="execute">
           <b-form-group
                label="Select your CamContract"
                label-for="address-select">
                <b-form-select @input="displayUnderlying(data)" v-model="data.addressInput" :options="camOptions" id="address-select">
                    <template #first>
                        <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                    </template>
                </b-form-select>
            </b-form-group>
            <p>{{ tokenInfo }}</p>
            <b-form-group
                label="Quantity to Enter"
                label-for="quantity-input">
                <b-form-input v-model='data.quantityInput' id="quantity-input"></b-form-input>
            </b-form-group>
        </form>      
    </b-modal>
</template>

<script>
    import BigNumber from 'bignumber.js';
    import global from "~/mixins/global.js";
    import cam from "~/mixins/cam.js";


    export default {
        mixins: [global, cam],
        computed: {
            tokenInfo() {
                if(this.data.tokenData.name !== "") {
                    return `${this.data.tokenData.name} | ${this.data.tokenData.symbol} | ${this.data.tokenData.humanBalance}`; 
                } else {
                    return "";
                }
            }
        },
        data(){
            return {
                camOptions: [],
                data:{
                    addressInput: "",
                    quantityInput: "",
                    description: "Enter A CamContract",
                    tokenData: {
                        name:"",
                        symbol:"",
                        humanBalance: ""
                    }
                }
            };
        },
        watch: {
            '$store.state.myAccount.coinbase': async function(_) {
                await this.setup();
            }
        },
        methods: {
            async setup() {
                this.addCamOptions(this.camOptions);
            },
            async execute(){
                this.beforeProcessing();

                var info = await this.getUnderlyingAaveInfo(this.data.addressInput);
                
                var underlyingTokenInfo = await this.getERC20Info(info.underlyingAssetAddress);
                var camInfo = await this.getERC20Info(this.data.addressInput);

                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(underlyingTokenInfo.decimals));
                
                var camTokens = await this.calculateCamtokensFromTokens(info, this.data.addressInput, quantity);
                console.log(camTokens);

                await this.callTokenToCamToken(
                    info.AaveLendingPool, 
                    quantity, 
                    info.underlyingAssetAddress, 
                    this.data.addressInput, 
                    info.ATokenAddress
                );

                this.inform(`Entering ${this.humanize(quantity, underlyingTokenInfo.decimals)} ${underlyingTokenInfo.name} for ${this.humanize(camTokens, camInfo.decimals)} ${camInfo.name}.`);

                this.afterProcessing();
            }
        }
    }
</script>