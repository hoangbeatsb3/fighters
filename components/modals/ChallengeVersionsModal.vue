<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-flex class="sm12">
      <v-card>
        <v-card-title primary-title>
          <h3 class="headline mb-0">Submitted versions</h3>
        </v-card-title>
        <v-card-text class="pt-0 pl-0 pr-0">
          <v-data-table
            v-bind:headers="headers"
            :items="versions"
            hide-actions
            item-key="submittedAt"
            v-bind:pagination.sync="pagination"
            class="elevation-1"
          >
            <!--Use slot-scope later-->
            <!--Refer to https://github.com/nuxt/nuxt.js/issues/2174 for more info -->
            <template slot="items" scope="props">
              <tr @click="props.expanded = !props.expanded">
                <td>{{ props.index + 1 }}</td>
                <td class="text-xs-left">{{ props.item.language }}</td>
                <td class="text-xs-center">{{ props.item.execTime }}</td>
                <td class="text-xs-center">
                  <v-icon color="green accent-4" v-if="props.item.isSolved">check</v-icon>
                  <v-icon color="red accent-3" v-else>clear</v-icon>
                </td>
                <td class="text-xs-right">{{ props.item.submittedAt | unixTsToRelativeTime }}</td>
              </tr>
            </template>
            <template slot="expand" scope="props">
              <v-card flat>
                <v-card-text>
                  <div class="code-highlighter" style="background-color: #00C853" v-if="props.item.isSolved"></div>
                  <div class="code-highlighter" style="background-color: #D50000" v-else></div>
                  <pre class="pl-2">{{ props.item.code }}</pre>
                  <v-tooltip top style="position: absolute; right: 10px; bottom: 5px">
                    <v-btn flat fab color="success" small slot="activator" @click="openCodeInEditor(props.item)">
                      <v-icon small>border_color</v-icon>
                    </v-btn>
                    <span>Open in editor</span>
                  </v-tooltip>
                </v-card-text>
              </v-card>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="info" @click="dialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-dialog>
</template>

<script>
  import {eventBus, httpCfg} from '~/util/util'
  import {mapGetters} from 'vuex'
  import moment from 'moment'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    name: 'challenge-versions-modal',
    data () {
      return {
        dialog: false,
        versions: [],
        headers: [
          { text: '#', align: 'left', sortable: false, value: 'version' },
          { text: 'Language', align: 'left', sortable: true, value: 'language' },
          { text: 'Execution time (ms)', align: 'center', sortable: true, value: 'execTime' },
          { text: 'Solved', align: 'center', sortable: false, value: 'solved' },
          { text: 'Submitted At', align: 'right', sortable: true, value: 'submittedAt' }
        ],
        pagination: {
          sortBy: 'submittedAt',
          descending: true
        }
      }
    },
    computed: {
      ...mapGetters(['authUser']),
      isAuth () {
        return this.authUser && this.authUser.uid
      }
    },
    methods: {
      loadSolvedChallenge () { // TODO: Load versions only
        if (!this.$route.params.id || !this.isAuth) {
          return
        }
        this.$axios.get(`${exeAddr}/api/v1/solved/u/${this.authUser.uid}/c/${this.$route.params.id}`, httpCfg)
          .then((res) => {
            this.versions = res.data.versions.sort((a, b) => {
              return a.submittedAt < b.submittedAt
            })
          }).catch((err) => {
            this.versions = []
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to load submitted versions: ${err}`})
          })
      },
      openCodeInEditor (val) {
        eventBus.versionCodeChanged(val)
        this.dialog = false
      }
    },
    filters: {
      unixTsToRelativeTime (val) {
        return moment(val).fromNow()
      }
    },
    created () {
      eventBus.$on('showChallengeVersionsModal', () => {
        this.dialog = true
        this.loadSolvedChallenge()
      })
    }
  }
</script>

<style>
  .code-highlighter {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }

  pre {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }
</style>

