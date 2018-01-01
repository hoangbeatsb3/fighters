<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="500px">
      <v-card>
        <v-card-title class="headline">Logout</v-card-title>
        <v-card-text>Do you want to logout?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Cancel</v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="logout">Yes, I'm out</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import {eventBus} from '~/util/util'
  import {mapMutations} from 'vuex'

  export default {
    name: 'logout-modal',
    data () {
      return {
        dialog: false
      }
    },
    methods: {
      ...mapMutations(['setAuthUser', 'setSettingsToDefault', 'setAvatar']),
      async logout () {
        try {
          await this.$axios.post('/logout')
          this.setAuthUser(null)
          this.setSettingsToDefault()
          this.setAvatar('')
          this.dialog = false
          // Delete all cookies
          document.cookie = 'excalibur=; Max-Age=0'
          document.cookie = 'cf_settings=; Max-Age=0'
          document.cookie = 'cf_states=; Max-Age=0'
          eventBus.snackbarShown({type: 'success', msg: 'Bye mate!'})
          eventBus.userLoggedOut()
        } catch (err) {
          console.log(err)
          eventBus.snackbarShown({type: 'error', msg: 'Logout failed: ' + err.message})
          this.dialog = false
        }
      }
    },
    created () {
      eventBus.$on('showLogoutModal', () => {
        this.dialog = true
      })
    }
  }
</script>
