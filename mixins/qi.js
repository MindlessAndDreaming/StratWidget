import global from "~/mixins/global.js";
import BigNumber from 'bignumber.js';
import IERC721_abi from "/static/IERC721/abi.json";
import IERC20stablecoin_abi from "/static/IERC20Stablecoin/abi.json";


export default {
    mixins:[global],
    computed: {
        vaultDebt() {
            if(this.data.vaultData.debt > 0) {
                return "Vault Debt (Flashloan this amount) > " + new BigNumber(this.data.vaultData.debt).dividedBy(new BigNumber(10).pow(18)).toFormat(5, BigNumber.ROUND_UP);
            } else {
                return "";
            }
        },
        vaultWithdrawableSurplus() {
            if(this.data.vaultData.surplusValue > 0) {
                return "Withdrawable Surplus MAI > " + new BigNumber(this.data.vaultData.surplusValue).dividedBy(new BigNumber(10).pow(18)).toFormat(5, BigNumber.ROUND_UP);
            } else {
                return "";
            }
        },
    },
    methods: {
        async addAllVaultOptions(vaultOptions) {
            var networkId = this.$store.state.myAccount.networkId
            var chainId = `${networkId}`;
            var vaults = this.data.vaults[chainId];
            var allvaults = [];
            for (var key in vaults) {
                allvaults = allvaults.concat(vaults[key]);
            }
            allvaults.map((vaultAddress) => {
                let vault = new window.w3.eth.Contract(IERC721_abi, vaultAddress);
                vault.methods.name().call((_, name) => {
                    vaultOptions.push({
                        text: name + " - " + vaultAddress,
                        value: vaultAddress
                    });
                });
            }); 
        },

        async addVaultOptions (vaultType, vaultOptions) {
            var networkId = this.$store.state.myAccount.networkId
            var chainId = `${networkId}`;
            var vaults = this.data.vaults[chainId][vaultType];

            if (vaults != undefined) {
                vaults.map((vaultAddress) => {
                    let vault = new window.w3.eth.Contract(IERC721_abi, vaultAddress);
                    vault.methods.name().call((_, name) => {
                        vaultOptions.push({
                            text: name + " - " + vaultAddress,
                            value: vaultAddress
                        });
                    });
                });
            } 

        },

        async getPriceSourceDecimals (vault) {
            try {
                console.log("trying collateral");
                return await vault.methods.collateralDecimals().call();
            } catch (error) {
                try {
                    console.log("trying priceSource");
                    return await vault.methods.priceSourceDecimals().call();
                } catch (error) {
                    console.log("trying backup");
                    return 8;
                }
            }  
        },

        async displayVaultDebt (data, {input="vaultIDInput", output="vaultData", vaultAddress="addressInput"} = {}) {
            try {
                var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, data[vaultAddress]);
                var debt = await vault.methods.vaultDebt(data[input]).call();
                var currentCollateral = await vault.methods.vaultCollateral(data[input]).call();
                var price = await vault.methods.getEthPriceSource().call();
                var withdrawableCollateral = new BigNumber(currentCollateral).multipliedBy(0.995).integerValue(BigNumber.ROUND_DOWN);
                var MAIPerToken = new BigNumber(price).dividedBy(new BigNumber(10).pow(8));
                var surplusValue = withdrawableCollateral.multipliedBy(MAIPerToken).minus(debt).multipliedBy(0.99).integerValue(BigNumber.ROUND_DOWN);
                
                data[output].surplusValue = surplusValue;
                data[output].debt = debt;
            } catch (error) {
                console.log(error);
            }  
        },

        async callDepositCollateral(vaultAddress, vaultId, collateralAddress, quantity) {
            var tokenInfo = await this.getERC20Info(collateralAddress);
            var vaultInfo = await this.getERC721Info(vaultAddress);
            
            var depositApprovalCall = this.maker("approve",["address", "uint256"],[vaultAddress, quantity]);
            this.makeRemoteCall( depositApprovalCall, {addressInput: collateralAddress, description: `allow ${vaultInfo.name} to pull ${this.humanize(quantity, tokenInfo.decimals)}  ${tokenInfo.name} from the worker to deposit into the vault`});

            var depositCall = this.maker("depositCollateral",["uint256", "uint256"],[vaultId, quantity]);
            this.makeRemoteCall( depositCall, {addressInput: vaultAddress, description: `deposit ${this.humanize(quantity, tokenInfo.decimals)}  ${tokenInfo.name} into ${vaultInfo.name} Id: ${vaultId}`});
        },

        async callWithdrawCollateral(vaultAddress, vaultId, collateralAddress, quantity) {
            var tokenInfo = await this.getERC20Info(collateralAddress);
            var vaultInfo = await this.getERC721Info(vaultAddress);
            
            var withdrawForSaleCall = this.maker("withdrawCollateral",["uint256", "uint256"],[vaultId, quantity]);
            this.makeRemoteCall( withdrawForSaleCall, {addressInput: vaultAddress, description: `withdraw ${this.humanize(quantity, tokenInfo.decimals)} ${tokenInfo.name} from ${vaultInfo.name} Id: ${vaultId}`});
        },

        async callBorrowToken(vaultAddress, vaultId, quantity) {
            var vaultInfo = await this.getERC721Info(vaultAddress);

            var borrowTokenCall = this.maker("borrowToken",["uint256", "uint256"],[vaultId, quantity]);
            this.makeRemoteCall( borrowTokenCall, {addressInput: vaultAddress, description: `borrow ${this.humanize(quantity, 18)} MiMATIC from ${vaultInfo.name} Id: ${vaultId} to pay the flashswap`});                
        },
        async callPayBackToken(vaultAddress, vaultId, quantity) {
            var vault = new window.w3.eth.Contract(IERC20stablecoin_abi, vaultAddress);
            var vaultInfo = await this.getERC721Info(vaultAddress);

            var payBackApprovalCall = this.maker("approve",["address", "uint256"],[vaultAddress, quantity]);
            this.makeRemoteCall( payBackApprovalCall, {addressInput: await vault.methods.mai().call(), description: `allow ${vaultInfo.name} to pull ${this.humanize(quantity, 18)} MiMATIC from the worker to pay back a loan`});

            var payBackCall = this.maker("payBackToken",["uint256", "uint256"],[vaultId, quantity]);
            this.makeRemoteCall( payBackCall, {addressInput: vaultAddress, description: `pay back ${this.humanize(quantity, 18)} MiMATIC in ${vaultInfo.name} Id: ${vaultId}`});
        }
    }
}