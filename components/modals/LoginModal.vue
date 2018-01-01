<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="500px">
      <v-form v-model="valid" ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">Login</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    :rules="accountRules"
                    v-model="loginForm.account"
                    label="Username/Email"
                    hint="Your TMA account or email"
                    @keyup.enter="login"
                    required></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    :rules="passwordRules"
                    v-model="loginForm.password"
                    label="Password"
                    type="password"
                    @keyup.enter="login"
                    required></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" flat @click.native="login" :disabled="!valid">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-layout>
</template>

<script>
  import {eventBus} from '~/util/util'
  import {mapMutations} from 'vuex'

  export default {
    name: 'login-modal',
    data () {
      return {
        dialog: false,
        valid: false,
        accountRules: [
          (v) => !!v || 'Account is required'
        ],
        passwordRules: [
          (v) => !!v || 'Password is required'
        ],
        loginForm: {
          account: '',
          password: ''
        }
      }
    },
    methods: {
      ...mapMutations(['setAuthUser', 'setSettings', 'setAvatar']),
      async login () {
        if (this.$refs.form.validate()) {
          try {
            let res = await this.$axios.post('/login', this.loginForm, {headers: {'Content-Type': 'application/json'}})
            this.setAuthUser({
              uid: res.data.uid,
              role: res.data.role,
              name: res.data.name
            })
            this.setSettings(res.data.settings)
            this.setAvatar(res.data.avatar)
            this.dialog = false
            eventBus.snackbarShown({type: 'success', msg: 'Login successfully'})
            eventBus.userLoggedIn() // Notify other components to update if necessary
          } catch (err) {
            console.log(err)
            if (err.response && err.response.status === 401) {
              eventBus.snackbarShown({type: 'error', msg: 'Bad credentials'})
              return
            }
            eventBus.snackbarShown({type: 'error', msg: 'Login failed. ' + err.message})
          }
        }
      }
    },
    created () {
      eventBus.$on('showLoginModal', () => {
        this.dialog = true
      })
    },
    beforeDestroy () {
      this.loginForm = {
        account: '',
        password: ''
      }
    }
  }
</script>
