export const state = () => ({
    coinbase: null,
    balance: null,
    networkId: null,
    workerAddress: null
})

export const mutations = {
    change(state, payload) {
        console.log('account changed', payload)

        state.coinbase = payload.coinbase
        state.networkId = payload.networkId
        state.balance = payload.balance
        var addressKey = `workerAddress${payload.networkId}`;
        if (localStorage.hasOwnProperty(addressKey)) {
            state.workerAddress = localStorage.getItem(addressKey);
        }    
    },
}