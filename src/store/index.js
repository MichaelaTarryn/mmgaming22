import { createStore } from 'vuex'

export default createStore({
  state: {
    slide:[
      {img:'https://i.postimg.cc/76xp1hTM/Apex-Legends.jpg'},
      {img:'https://i.postimg.cc/2jHfwQGq/cod.jpg'},
      {img:'https://i.postimg.cc/k4fLTCQr/f122.jpg'},
      {img:'https://i.postimg.cc/5t5hFLj2/gothamknights.jpg'},
      {img:'https://i.postimg.cc/HsR1GTfd/pokemon.jpg'},
      {img:'https://i.postimg.cc/3NqVHZfn/xbox.jpg'}
    ],
    fclick: [
      {name:'catergory',
    sub:'fill',
    sub:'fill',
    sub:'fill',
    sub:'fill',
    },
    {name:'genre',
      sub:'fill',
      sub:'fill',
      sub:'fill',
      sub:'fill',},
      
    ],
    filter: [
    {name:'Price low - high'},
      {name:'Price high - low'},
      {name:'A-Z'},
      {name:'Z-A'}, 
    ]
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
