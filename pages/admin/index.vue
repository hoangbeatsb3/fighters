<template>
  <v-container fluid>
    <v-layout>
      <v-flex class="xs12">
        <v-card>
          <v-card-title primaryTitle>
            <span class="headline">Post Challenge</span>
            <v-spacer></v-spacer>
            <v-text-field v-model="cid" label="input existed challenge id:" @keyup.enter="getChallenge"></v-text-field>
          </v-card-title>
          <v-card-text class="pt-0">
            <h3 style="color: #66BB6A">Metas</h3>
            <v-form>
              <v-layout>
                <v-flex class="xs4">
                  <v-text-field
                    label="Title"
                    v-model="c.title"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex class="xs7 pl-3 pr-3">
                  <v-text-field
                    label="Short description"
                    v-model="c.shortDesc"
                    textarea
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex class="xs1">
                  <v-text-field
                    label="Points"
                    v-model="c.point"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-text-field
                label="Description"
                v-model="c.description"
                textarea
                required
              ></v-text-field>

              <v-checkbox
                label="Disabled"
                v-model="c.disabled"
                color='info'></v-checkbox>
            </v-form>

            <h3 class="mt-4 mb-2" style="color: #66BB6A">Templates, Fixtures and Test cases</h3>
            <v-select
              v-bind:items="slLanguages"
              v-model="data.language"
              hint="Choose language"
              persistent-hint
              solo
              light
              label="Select language"
            ></v-select>
            <v-layout justify-space-around>
              <v-flex>
                <v-text-field
                  label="Template"
                  v-model="data.template"
                  textarea
                  required
                ></v-text-field>
              </v-flex>
              <v-flex class="pr-2 pl-2">
                <v-text-field
                  label="Fixture"
                  v-model="data.fixture"
                  textarea
                  required
                ></v-text-field>
              </v-flex>
              <v-flex>
                <v-text-field
                  label="Test Cases"
                  v-model="data.testCases"
                  textarea
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-btn flat outline color="success" @click="appendData" :disabled="!data.language">Set {{data.language}} data to challenge</v-btn>

            <h3 class="mt-4" style="color: #66BB6A">Preview</h3>
            <pre class="json">{{ this.c | toJSON }}</pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="postChallenge">Post challenge</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {eventBus, httpCfg} from '~/util/util'
  import {mapGetters, mapMutations} from 'vuex'
  let exeAddr = process.env.EXECUTIONER_ADDRESS
  let defaultChallenge = {
    title: '',
    shortDesc: '',
    description: '',
    point: 100,
    solvedBy: 0,
    disabled: true,
    data: []
  }
  let defaultData = {
    language: '',
    template: '',
    fixture: '',
    testCases: '',
    timeout: 60000
  }

  export default {
    data () {
      return {
        cid: null,
        c: defaultChallenge,
        data: defaultData,
        slLanguages: [
          {text: 'C', value: 'c'},
          {text: 'C++', value: 'cpp'},
          {text: 'Go', value: 'go'},
          {text: 'Java', value: 'java'},
          {text: 'Javascript', value: 'javascript'},
          {text: 'Kotlin', value: 'kotlin'},
          {text: 'Python3', value: 'python3'}
        ],
        loading: false
      }
    },
    computed: {
      ...mapGetters(['authUser'])
    },
    watch: {
      authUser (val) {
        if (!val || val.role !== 1) {
          location.href = '/'
        }
      },
      'data.language' (val) {
        for (let d of this.c.data) {
          if (d.language === val) {
            this.data = JSON.parse(JSON.stringify(d)) // Load appended data to form
            return
          }
        }
        // Otherwise reset to default
        this.data = defaultData
        this.data.language = val
      }
    },
    methods: {
      ...mapMutations(['setDrawer']),
      appendData () {
        for (let i = 0; i < this.c.data.length; i++) {
          if (this.c.data[i].language === this.data.language) {
            this.$set(this.c.data, i, JSON.parse(JSON.stringify(this.data)))
            // hey should in there
            // this.c.data[i] = JSON.parse(JSON.stringify(this.data)) // Overwrite form data in challenge
            return
          }
        }
        // Put form data to challenge
        this.c.data.push(JSON.parse(JSON.stringify(this.data)))
      },
      postChallenge () {
        this.loading = true
        let p
        if (this.cid) {
          p = this.$axios.patch(`${exeAddr}/api/v1/dev/challenges/${this.cid}`, this.c, httpCfg)
        } else {
          p = this.$axios.post(`${exeAddr}/api/v1/dev/challenges`, this.c, httpCfg)
        }
        p
          .then((res) => {
            console.log('challenge created', res.data)
            eventBus.snackbarShown({type: 'success', msg: 'Challenge saved. Please find more info from console!'})
            if (!this.cid) {
              // we'll keep the data when modified for easy check and update
              this.cid = null
              this.c = defaultChallenge
              this.data = defaultData
            }
            this.loading = false
          })
          .catch((err) => {
            this.loading = false
            console.error('Error saving challenge', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to save challenge: ${err}`})
          })
      },
      // FIXME this is unsecure and only for POC not use those in prod until they are all protected
      getChallenge () {
        this.$axios.get(`${exeAddr}/api/v1/dev/challenges/f/${this.cid}`, httpCfg)
          .then((res) => {
            this.c = res.data || defaultChallenge
            delete this.c['_id']
            this.data = (this.c.data || []).length ? this.c.data[0] : defaultData
          })
          .catch((err) => {
            eventBus.snackbarShown({type: 'error', msg: `Failed to load challenge ${this.cid} due to ${err}`})
          })
      }
    },
    filters: {
      toJSON (val) {
        return JSON.stringify(val, null, 2)
      }
    },
    mounted () {
      if (!this.authUser || this.authUser.role !== 1) { // Administrator
        location.href = '/'
      }
      this.setDrawer(false)
      eventBus.drawerToggled(false)
    }
  }
</script>

<style scoped>
  pre.json {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }
</style>
