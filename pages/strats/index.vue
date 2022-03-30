<template>
    <div>
        <v-select label="name" :options="actions"  @input="addTask"/>
        <div v-if="loading" class="loading-page">
            <p>{{loadingMessage}}</p>
        </div>
        <b-row> 
            <b-col class="m-3">
                Worker Address &nbsp; <a :href="`https://${explorer_url}/address/${worker_address}`">{{worker_address}}</a>
            </b-col>
        </b-row>
        <div class="accordion" role="tablist">
            <b-card no-body class="mb-1"  v-for="task in activeTasks" v-bind:key="task.id">
                <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button squared block v-b-toggle="task.id" variant="outline-info">{{ task.description }}</b-button>
                </b-card-header>
                <b-collapse :id="task.id" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                        <b-card-text v-for="(value, key, index) in task" v-bind:key="index">
                            {{key}} : {{value}} <br/>
                        </b-card-text>
                    </b-card-body>
                </b-collapse>
            </b-card>
        </div>

        <b-button :pressed.sync="flashLoan.toggled" squared variant="outline-secondary" @click="setFlashLoan" >{{ wrapMessage }}</b-button>
        <b-button squared variant="warning" @click="doTasks" >execute</b-button>
        <b-button squared variant="success" @click="reset" >reset</b-button>
        
        <b-modal id="wrapperModal" @ok="setFlashLoan" >
            <form ref="setFlash" @submit="setFlashLoan">
                <b-form-group
                    label="Select your FlashLoan provider"
                    label-for="flash-select">
                    <b-form-select v-model="flashLoan.provider" :options="flashOptions" id="flash-select"></b-form-select>
                </b-form-group>
                <b-form-group
                    label="Quantity"
                    label-for="quantity-input">
                    <b-form-input v-model='flashLoan.quantityInput' id="quantity-input"></b-form-input>
                </b-form-group>
            </form>
        </b-modal>

        <ActionsProvideAllowance />
        <ActionsProvide721Allowance />
        <ActionsWithdraw20 />
        <ActionsRepayVault />
        <ActionsWithdraw721  />
        <ActionsRepayCamVault  />
        <ActionsRepayMooSingleVault  />
        <ActionsLeverVault  />
        <ActionsLeverCamVault  />
        <ActionsLeverMooSingleVault  />
        <ActionsLiquidateVault  />
        <ActionsLiquidateCamVault  />
        <ActionsLiquidateMooSingleVault  />


    </div>
</template>

<script>
    import vSelect from 'vue-select';
    import global from "~/mixins/global.js";
    import { BigNumber } from "bignumber.js";
    import Worker_abi from "/static/Worker/abi.json";
    import IUniswapv2Pair_abi from "/static/IUniswapV2Pair/abi.json";
    import IUniswapv2Factory_abi from "/static/IUniswapV2Factory/abi.json";
    import IUniswapv2Router02_abi from "/static/IUniswapV2Router02/abi.json";

    const e18 = new BigNumber("1e18");

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    export default {
        loading: {
            color: 'blue',
            height: '15px',
            duration: 30000,
            continuous: true
        },
        mixins: [global],
        computed : {
            activeTasks () {
                return this.taskList.filter(i => i.queued == true);
            },
            wrapMessage() {
                if (this.flashLoan.toggled) {
                    return "Wrapping All Tasks In Flash loan, click here to disable";
                } else {
                    return "Click to Start Using Flash loans";
                }
            },
            explorer_url() {
                var nId = this.$store.state.myAccount.networkId;
                if (nId == 137) {
                    return "polygonscan.com";
                } else if (nId == 250) {
                    return "ftmscan.com";
                }
            }
        },
        data() {
            return {
                loading: false,
                loadingMessage: "Loading ...",
                stratbatch: "",
                dataMap: {},
                taskMap: {},
                actions : [],
                taskList : [],
                flashLoan: {
                    toggled: false,
                    quantityInput:"1",
                    provider: null
                },
                

            }
        },
        components: {
            vSelect,
        },
        async mounted () {
            this.$nuxt.$on("createdRemoteCall", (result) => {
                this.taskList.push(this.createTaskFromData(result.data, result.encodedFunctionCall)); 
            });
            this.$nuxt.$on("createdLocalCall", (result) => {
                this.taskList.push(this.createTaskFromData(result.data, result.encodedFunctionCall)); 
                this.initBatchList();
                this.stratbatch.add(result.call); 
            });
            this.$nuxt.$on("requestedFlashLoan", (result) => {
                console.log(JSON.stringify(result));
               this.flashLoan.provider = result.loan.provider;
               this.flashLoan.quantityInput = result.loan.quantity_in_eth;
               this.flashLoan.toggled = true;
            });

            this.updateActions();
        },
        methods: {
            updateActions () {
                this.addAction({
                    "name":  "provide allowance for tokens",
                    "modal": "provideContractAllowance"
                });
                this.addAction({
                    "name":  "Withdraw Tokens",
                    "modal": "withdraw20"
                });
                this.addAction({
                    "name":  "Provide Allowance for NFT",
                    "modal": "provide721ContractAllowance"
                });
                this.addAction({
                    "name":  "Withdraw AN NFT",
                    "modal": "withdraw721"
                });
                this.addAction({
                    "name":  "Repay MAI Vault (single)",
                    "modal": "repayVault"
                });
                this.addAction({
                    "name":  "Repay MAI Vault (CAM)",
                    "modal": "repayCamVault"
                });
                this.addAction({
                    "name":  "Repay MAI Vault (Moo Single Token e.g MOOFBIFI)",
                    "modal": "repayMooSingleVault"
                });
                this.addAction({
                    "name":  "Lever MAI vault (single)",
                    "modal": "leverVault"
                });
                this.addAction({
                    "name":  "Lever MAI vault (CAM token)",
                    "modal": "leverCamVault"
                });
                this.addAction({
                    "name":  "Lever MAI vault (Moo Single token)",
                    "modal": "leverMooSingleVault"
                });
                this.addAction({
                    "name":  "Liquidate MAI Vault (Single)",
                    "modal": "liquidateVault"
                });
                this.addAction({
                    "name":  "Liquidate MAI Vault (CAM Token)",
                    "modal": "liquidateCamVault"
                });
                this.addAction({
                    "name":  "Liquidate MAI Vault (Moo Single)",
                    "modal": "liquidateMooSingleVault"
                });
            },

            addAction(action){
                this.actions.push(action);
            },

            addTask (value) {
                if(value != null ) {
                    this.$bvModal.show(value.modal);
                }
            },

            handleOk (event, message){
                console.log(message);
                var tasker =  this.taskMap[event.target.id];

                for (let i = 0; i < tasker.tasks.length; i++) {
                    this[tasker.tasks[i]](this.dataMap[event.target.id]);
                } 
            },

            initBatchList(){
                if(this.stratbatch == "" ){
                    this.stratbatch = new window.w3.BatchRequest();
                }
            },

            createTaskFromData(data, encodedFunctionCall) {
                return {
                    id: this.taskList.length.toString(),
                    encodedFunctionCall: encodedFunctionCall,
                    description: data.description,
                    address: data.addressInput,
                    queued: true,
                    local: data.local ? true : false 
                }
            },

            removeTask(id) {
                for(let i=0; i<this.taskList.length; i++){
                    if(this.taskList[i].id == id){
                        this.taskList[i].queued = false;
                    }
                }
            },

            reset() {
                this.loading = false;
                this.stratbatch = "";
                this.taskList = [];
                this.flashLoan = {
                    toggled: false,
                    quantityInput:"1",
                    provider: null
                };
            },

            setFlashLoan(){
                if (this.flashLoan.toggled) {
                    this.$bvModal.show("wrapperModal");
                } 
            },

            async wrapTransaction(transactions){
                this.loading = true;
                console.log(JSON.stringify(this.flashLoan.provider));

                var Router = new window.w3.eth.Contract(IUniswapv2Router02_abi, this.flashLoan.provider.router);

                this.loadingMessage = "Getting Factory";
                var factory_address = await Router.methods.factory().call();
                var Factory = new window.w3.eth.Contract(IUniswapv2Factory_abi, factory_address);
                

                this.loadingMessage = "Getting The Pair Contract";
                var pair_address = await Factory.methods.getPair(this.flashLoan.provider.mai, this.flashLoan.provider.other).call();

                var PairV2 = new window.w3.eth.Contract(IUniswapv2Pair_abi, pair_address);
                
                this.loadingMessage = "Getting the Pair Addresses";
                var token0Address = await PairV2.methods.token0().call();
                var token1Address = await PairV2.methods.token1().call();

                var quantityBorrowing = new BigNumber(this.flashLoan.quantityInput).multipliedBy(e18);
                var quantityPayable = quantityBorrowing.multipliedBy(1000).dividedBy(996).integerValue().toString();

                this.loadingMessage = "Encoding the Request";
                var amount0 = token0Address == this.flashLoan.provider.mai ?  quantityBorrowing: 0;
                var amount1 = token1Address == this.flashLoan.provider.mai ?  quantityBorrowing: 0;

                var encodedStruct = window.w3.eth.abi.encodeParameter(
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "sourceRouterAddress",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "assetReceived",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "quantityPayable",
                                "type": "uint256"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "address",
                                        "name": "To",
                                        "type": "address"
                                    },
                                    {
                                        "internalType": "bytes",
                                        "name": "Data",
                                        "type": "bytes"
                                    }
                                ],
                                "internalType": "struct Worker.Action[]",
                                "name": "actions",
                                "type": "tuple[]"
                            }
                        ],
                        "internalType": "struct Worker.TransactionDetails",
                        "name": "details",
                        "type": "tuple"
                    },
                    {
                        sourceRouterAddress: this.flashLoan.provider.router,
                        assetReceived: this.flashLoan.provider.mai,
                        quantityPayable: quantityPayable,
                        actions: transactions
                    }
                );

                
                this.loading = false;

                return PairV2.methods.swap(
                    amount0,
                    amount1,
                    this.worker_address,
                    encodedStruct
                );
            },

            async doTasks() {
                this.initBatchList();

                if (this.taskList.length > 0) {

                    var transactions = [];

                    for(let i=0; i<this.taskList.length; i++){
                        if(this.taskList[i].queued && !this.taskList[i].local){
                            transactions.push({
                                To: this.taskList[i].address,
                                Data: this.taskList[i].encodedFunctionCall
                            });
                        }
                    }

                    var callback = async (err, result) => {
                            if(err){console.log(err)}
                            else {
                                console.log(result);
                                let transactionReceipt = null
                                while (transactionReceipt == null) {
                                    transactionReceipt = await new window.w3.eth.getTransactionReceipt(result);
                                    await sleep(2500);
                                }
                                console.log(transactionReceipt);
                                this.stratbatch = "";
                                this.taskList = []
                            }
                    };

                    try {
                        if(this.flashLoan.toggled && transactions.length > 0) {
                            var whole_transaction = await this.wrapTransaction(transactions);
                            this.stratbatch.add(whole_transaction.send.request({
                                        from: this.coinbase,
                                        gasPrice: this.gas_price,
                                        gas: this.gas_amount
                                }, callback)
                            );
                        } else {
                            if(transactions.length > 0){
                                var Worker = new window.w3.eth.Contract(Worker_abi, this.worker_address);
                                var method = Worker.methods.execute(transactions);
                                
                                this.stratbatch.add(
                                    method.send.request({
                                            from: this.coinbase,
                                            gasPrice: this.gas_price,
                                            gas: this.gas_amount
                                    }, callback)
                                );                                
                            }
                        } 
                    } catch (error) {
                        console.log(error);
                    }   
                }
                this.stratbatch.execute();
            },
        } 
    };
</script>
