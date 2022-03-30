<template>
    <b-modal id="withdrawRemaining" @ok="WithdrawRemaining" >
        <form @submit="WithdrawRemaining">
            <b-form-group
                    label="Token Address"
                    label-for="address-input">
                    <b-form-input @input="displayERC20(data)" v-model="data.addressInput" id="address-input"></b-form-input>
            </b-form-group>
            <p>{{ tokenInfo }}</p>
            <p> mai: {{ mai }}</p>      
        </form>
    </b-modal>
</template>

<script>
    import global from "~/mixins/global.js";
    import Worker_abi from "/static/Worker/abi.json";

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
                    addressInput: "",
                    description: "Withdraw Remaining Tokens From Contract",
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
            WithdrawRemaining(){
                var Worker = new window.w3.eth.Contract(Worker_abi, this.worker_address);
                var withdrawal = Worker.methods.withdraw(this.data.addressInput);
                this.makeLocalCall(withdrawal, this.data);
            }
        }
    }
</script>