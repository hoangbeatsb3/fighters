<template>
  <v-dialog v-model="dialog" persistent max-width="700px">
    <v-flex class="sm12">
      <v-card>
        <v-card-title primary-title>
          <h3 class="headline mb-0">Settings</h3>
        </v-card-title>
        <v-card-text v-if="localSettings">
          <h3 style="color: #66BB6A">Languages</h3>
          <v-select
            v-bind:items="slLanguages"
            v-model="localSettings.language"
            hint="Choose your weapon"
            persistent-hint
          ></v-select>

          <h3 class="pt-4" style="color: #66BB6A">Code Editor</h3>
          <v-layout>
            <v-flex class="xs6">
              <v-select
                v-bind:items="slEditorThemes"
                v-model="localSettings.editor.theme"
                hint="Theme"
                persistent-hint
              ></v-select>
            </v-flex><v-flex class="xs5 offset-xs1">
              <v-select
                v-bind:items="slEditorFontSizes"
                v-model="localSettings.editor.fontSize"
                hint="Font size"
                persistent-hint
              ></v-select>
            </v-flex>
          </v-layout>

          <h3 class="pt-4 pb-2" style="color: #66BB6A">Challenges</h3>
          <v-switch v-model='swHideSolved' label='Hide all solved challenges' color='info'></v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="dialog = false" :disabled="loading">Cancel</v-btn>
          <v-btn color="info" @click="updateSettings" :loading="loading">update</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-dialog>
</template>

<script>
  import {eventBus, httpCfg} from '~/util/util'
  import {mapGetters, mapMutations} from 'vuex'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    name: 'settings-modal',
    data () {
      return {
        dialog: false,
        localSettings: null,
        // Vuetify v-switch failed to bind nested object localSettings.hideSolved so have to use this prop instead
        swHideSolved: false,
        loading: false,
        slLanguages: [
          {text: 'C', value: 'c'},
          {text: 'C++', value: 'cpp'},
          {text: 'Go', value: 'go'},
          {text: 'Java', value: 'java'},
          {text: 'Javascript', value: 'javascript'},
          {text: 'Kotlin', value: 'kotlin'},
          {text: 'Python3', value: 'python3'}
        ],
        slEditorThemes: [
          {text: 'Ambiance', value: 'ambiance'},
          {text: 'Clouds', value: 'clouds'},
          {text: 'Cobalt', value: 'cobalt'},
          {text: 'Github', value: 'github'},
          {text: 'Monokai', value: 'monokai'},
          {text: 'Pastel On Dark', value: 'pastel_on_dark'},
          {text: 'Solarized Dark', value: 'solarized_dark'},
          {text: 'Solarized Light', value: 'Solarized Light'},
          {text: 'Terminal', value: 'terminal'},
          {text: 'Tomorrow', value: 'tomorrow'},
          {text: 'Tomorrow Night', value: 'tomorrow_night'},
          {text: 'Twilight', value: 'twilight'},
          {text: 'Vibrant Ink', value: 'vibrant_ink'},
          {text: 'XCode', value: 'xcode'}
        ],
        slEditorFontSizes: [
          {text: '12', value: '12px'},
          {text: '13', value: '13px'},
          {text: '14', value: '14px'},
          {text: '15', value: '15px'},
          {text: '16', value: '16px'},
          {text: '17', value: '17px'},
          {text: '18', value: '18px'},
          {text: '19', value: '19px'},
          {text: '20', value: '20px'},
          {text: '21', value: '21px'},
          {text: '22', value: '22px'},
          {text: '23', value: '23px'},
          {text: '24', value: '24px'}
        ]
      }
    },
    computed: {
      ...mapGetters(['authUser', 'settings'])
    },
    watch: {
      swHideSolved (val) {
        if (!this.localSettings) {
          return
        }
        this.localSettings.hideSolved = JSON.parse(JSON.stringify(val))
      }
    },
    methods: {
      ...mapMutations(['setSettings']),
      updateSettings () {
        this.loading = true
        this.$axios.post(`${exeAddr}/api/v1/users/${this.authUser.uid}/settings`, this.localSettings, httpCfg)
          .then((result) => {
            this.setSettings(JSON.parse(JSON.stringify(this.localSettings))) // Reflect updated settings back to global state
            eventBus.snackbarShown({type: 'success', msg: `Your settings was updated`})
            this.loading = false
            this.dialog = false
          })
          .catch((err) => {
            this.loading = false
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to update settings: ${err}`})
          })
      }
    },
    created () {
      eventBus.$on('showSettingsModal', () => {
        this.dialog = true
      })
      this.localSettings = JSON.parse(JSON.stringify(this.settings)) // Sync global state to local var
      this.swHideSolved = JSON.parse(JSON.stringify(this.localSettings.hideSolved))
    },
    beforeDestroy () {
      this.localSettings = null
    }
  }
</script>
