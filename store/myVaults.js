export const state = () => ({
    list: []
})

export const mutations = {
    add(state, vault) {
      state.list.push(vault);
    },
    remove(state, id) {
      var index = state.list.findIndex(vault => vault.id === id);
      state.list.splice(index, 1);
    },
    update(state, uVault){
      var index = state.list.findIndex(vault => vault.id === uVault.id);
      if (index > -1){
        state.list[index] = uVault;
      } else {
        state.list.push(uVault);
      }
    }
}