<template>
    <b-modal id="withdraw721" @ok="execute" >
        <form @submit="execute">
            <b-form-group
                    label="Select your Vault"
                    label-for="address-select">
                    <b-form-select @input="displayERC721(data)" v-model="data.addressInput" :options="vaultOptions" id="address-select">
                        <template #first>
                            <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                        </template>
                    </b-form-select>
                </b-form-group>
            <p>{{ tokenInfo }}</p>
            <b-form-group
                label="ID"
                label-for="id-input">
                <b-form-input v-model='data.idInput' id="id-input"></b-form-input>
            </b-form-group>
        </form>      
    </b-modal>
</template>

<script>
    import global from "~/mixins/global.js";
    import IERC721_abi from "/static/IERC721/abi.json";


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
                    idInput: "",
                    description: "Ask the Worker to return an NFT",
                    tokenData: {
                        name:"",
                        symbol:""
                    }
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
                this.addAllVaultOptions(this.vaultOptions);
            },
            execute(){                
                var transferCall = this.maker("transferFrom",["address", "address", "uint256"],[this.worker_address, this.coinbase, this.data.idInput]);
                this.makeRemoteCall( transferCall, {addressInput: this.data.addressInput, description: "Ask The worker to return an NFT"});
            }
        }
    }
</script>