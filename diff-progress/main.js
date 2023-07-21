import './style.css'
import Vue from '../dist/vue.esm'
import DiffProgress from './src/index'

new Vue({
  el: '#app',
  data() {
    return {
      list: ['D', 'C', 'B', 'A']
    }
  },
  methods: {
    sort() {
      this.list = ['D', 'C']
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
