export const state = () => ({
    coinbase: null,
    balance: null,
    networkId: null
})

export const mutations = {
    change(state, payload) {
        console.log('account changed', payload)

        state.coinbase = payload.coinbase
        state.networkId = payload.networkId
        state.balance = payload.balance    
    },
}