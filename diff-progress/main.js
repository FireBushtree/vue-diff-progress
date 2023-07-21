import './style.css'
import Vue from '../dist/vue.esm'
import DiffProgress from './src/index'

new Vue({
  el: '#app',
  data() {
    return {
      list: ['A', 'B']
    }
  },
  methods: {
    sort() {
      this.list = ['A', 'B', 'C', 'D']
    }
  },
  updated() {
    const { diffNodes, diffQueue } = this.$el
    const diff = new DiffProgress('#canvas', {
      diffNodes,
      diffQueue
    })

    diff.start()
  }
})
