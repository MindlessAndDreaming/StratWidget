<template>
    <b-modal id="provideContractAllowance" @ok="provideContractAllowance" >
            <form ref="provideAllowance" @submit="provideContractAllowance">
                <b-form-group
                    label="Token Address"
                    label-for="address-input">
                    <b-form-input @input="displayERC20(data)" v-model="data.addressInput" id="address-input"></b-form-input>
                </b-form-group>
                <p>{{ tokenInfo }}</p>
                <b-form-group
                    label="Quantity"
                    label-for="quantity-input">
                    <b-form-input v-model='data.quantityInput' id="quantity-input"></b-form-input>
                </b-form-group>
                <p> mai: {{ mai }}</p>
                
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
                    return this.data.tokenData.name + " | " + this.data.tokenData.symbol + " | " + this.data.tokenData.humanBalance 
                } else {
                    return "";
                }
            }
        },
        data(){
            return {
                data:{
                    addressInput: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
                    quantityInput: "1",
                    description: "Aprove and Send the Contract An Allowance",
                    tokenData: {
                        name:"",
                        symbol:"",
                        balance:"",
                        humanBalance:""
                    }
                }
            };
        },
        methods: {
            async provideContractAllowance(){
                var Token = new window.w3.eth.Contract(IERC20_abi, this.data.addressInput);
                var decimals =  await Token.methods.decimals().call();
                var quantity = new BigNumber(this.data.quantityInput).multipliedBy(new BigNumber(10).pow(decimals));                
                var approval = Token.methods.approve(this.worker_address, quantity);
                this.makeLocalCall(approval, this.data);

                var encodedFunctionCall = this.maker( "transferFrom", ["address", "address", "uint256"], [this.coinbase, this.worker_address, quantity]);
                this.makeRemoteCall(encodedFunctionCall, this.data);
            }
        }
    }
</script>