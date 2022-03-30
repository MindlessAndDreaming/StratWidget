<template>
    <b-modal id="withdraw20" @ok="execute" >
        <form @submit="execute">
            <b-form-group
                    label="Token Address"
                    label-for="address-input">
                    <b-form-input @input="displayERC20(data)" v-model="data.addressInput" id="address-input"></b-form-input>
            </b-form-group>
            <p>{{ tokenInfo }}</p>
            <p> mai: {{ mai }}</p>
            <b-form-group
                label="Quantity to Withdraw"
                label-for="quantity-input">
                <b-form-input v-model='data.quantityInput' id="quantity-input"></b-form-input>
            </b-form-group>
        </form>      
    </b-modal>
</template>

<script>
import BigNumber from 'bignumber.js';
    import global from "~/mixins/global.js";
    import IERC20_abi from "/static/IERC20/abi.json";


    export default {
        mixins: [global],
        computed: {
            tokenInfo() {
                if(this.data.tokenData.name !== "") {
                    return this.data.tokenData.name + " | " + this.data.tokenData.symbol 
                } else {
                    return "";
                }
            }
        },
        data(){
            return {
                vaultOptions: [],
                data:{
                    addressInput: "",
                    quantityInput: "",
                    description: "Ask the Worker to send you tokens",
                    tokenData: {
                        name:"",
                        symbol:""
                    }
                }
            };
        },
        methods: {
            async execute(){
                var Token = new window.w3.eth.Contract(IERC20_abi, this.data.addressInput);
                var decimals =  await Token.methods.decimals().call();
                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(decimals));                
                await this.returnERC20ToUser(this.data.addressInput, quantity);
            }
        }
    }
</script>