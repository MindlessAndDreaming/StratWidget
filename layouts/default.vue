<template>
  <div>
    <b-navbar variant="dark" type="dark">
      <b-navbar-brand>
        <NuxtLink to="/">Index</NuxtLink>
      </b-navbar-brand>
      <b-navbar-nav>
        <NuxtLink to="/strats">strats</NuxtLink>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item> 
          Network: {{ networkId }}
        </b-nav-item>
        <b-nav-item> 
          Account: {{ coinbase }}
        </b-nav-item>
        <b-nav-item> 
          Balance: {{ balance }}
        </b-nav-item>
        <b-nav-item>
            <b-button >
                {{ coinbase ? "Connected" : "Connect" }} to Metamask
            </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <b-container>
      <Nuxt />
    </b-container>
  </div>
</template>

<style>
  @import "../node_modules/vue-select/dist/vue-select.css";
</style>

<script>
    import BigNumber from 'bignumber.js';

    import { mapGetters, mapMutations } from 'vuex';

    export default {
        ssr: false,
        data () {
            return {}
        },
        async mounted() {
            await this.initEVMSupport();      
        },

        computed: {
            ...mapGetters('w3i', ['getInstance']),
            w3i () {
                return this.getInstance
            },
            balance () {
                 return this.$store.state.myAccount.balance
            },
            coinbase () {
                 return this.$store.state.myAccount.coinbase
            },
            networkId () {
                return this.$store.state.myAccount.networkId
            }

        },

        methods: {
            ...mapMutations('w3i', ['registerW3Instance']),

            async handleAccountEvent () {
                const networkId = await window.w3.eth.net.getId();
                const coinbase = await window.w3.eth.getCoinbase();
                var balance = await window.w3.eth.getBalance(coinbase);

                var balance = new BigNumber(balance).dividedBy(new BigNumber("1e18")).toFixed(4);
                this.$store.commit('myAccount/change', {
                  networkId,
                  coinbase,
                  balance
                });
            },

            async handleChainEvent () {
                window.location.reload();
            },

            async initEVMSupport() {
                if (window.ethereum) {
                    window.w3 = new this.$Web3(window.ethereum);
                    try {
                        // Request account access
                        await ethereum.request({method: 'eth_requestAccounts'}) ;
                        console.log("This browser is supported for ethereum");

                        await this.handleAccountEvent();
                        
                        window.ethereum.on("accountsChanged", this.handleAccountEvent);
                        window.ethereum.on("chainChanged", this.handleChainEvent);
                        return true;
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                }
                // Non-decentralized app browsers...
                else {
                    console.log(
                        "Non-Ethereum browser detected. You should consider trying MetaMask!"
                    );
                }
            }
        },
    }
</script>
