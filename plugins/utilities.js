import Vue from 'vue'
import md from 'marked'

md.setOptions({
  gfm: false
})

Vue.mixin({
  methods: {
    marked: str => md(str)
  }
})
