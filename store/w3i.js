const w3i = {
    namespaced: true,
    state: () => ({
        w3i: {
            networkId: null,
            coinbase: null,
            balance: null,
        },
    }),
    getters: {
        getInstance: (state) => {
            return state.w3i
        },
    },
    mutations: {
        registerW3Instance (state, payload) {
            console.log('registerW3instance Mutation being executed', payload)
            let result = payload
            let w3iCopy = state.w3i
            w3iCopy.coinbase = result.coinbase
            w3iCopy.networkId = result.networkId
            w3iCopy.balance = result.balance
            state.w3i = w3iCopy
        },
    },
    actions: {
    }
}

export default w3i
