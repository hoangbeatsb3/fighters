<template>
  <v-snackbar :color="color" :timeout="timeout" v-model="snackbar" top>
    {{ msg }}
    <v-btn flat color="white" @click.native="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
  import {eventBus} from '~/util/util'

  export default {
    name: 'snackbar',
    data () {
      return {
        snackbar: false,
        color: '',
        msg: '',
        timeout: 0
      }
    },
    created () {
      eventBus.$on('showSnackbar', (data) => {
        if (!data || !data.msg) {
          return
        }
        this.msg = data.msg
        if (!data.timeout) {
          data.timeout = 3000
        }
        this.timeout = data.timeout
        if (!data.type) {
          data.type = 'info'
        }
        this.color = data.type
        this.snackbar = true
      })
    }
  }
</script>
