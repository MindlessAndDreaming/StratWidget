import global from "~/mixins/global.js";
import BigNumber from 'bignumber.js';
import IERC20stablecoin_abi from "/static/IERC20Stablecoin/abi.json";


export default {
    mixins:[global],
    methods: {
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