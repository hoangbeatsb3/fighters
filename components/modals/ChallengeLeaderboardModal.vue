<template>
  <v-dialog v-model="dialog" max-width="700px">
    <v-flex class="sm12">
      <v-card>
        <v-card-title primary-title>
          <h3 class="headline mb-0">Leaderboard</h3>
        </v-card-title>
        <v-card-text class="pt-0 pr-0 pl-0">
          <v-data-table
            v-bind:headers="headers"
            :items="rows"
            hide-actions
            item-key="uid"
            v-bind:pagination.sync="pagination"
            class="elevation-1"
          >
            <!--Use slot-scope later-->
            <!--Refer to https://github.com/nuxt/nuxt.js/issues/2174 for more info -->
            <template slot="items" scope="props">
              <tr @click.stop="openUserProfile(props.item.uid)" style="cursor: pointer">
                <td>{{ props.index + 1 }}</td>
                <td class="text-xs-left">{{ props.item.uid }}</td>
                <td class="text-xs-center">{{ props.item.language}}</td>
                <td class="text-xs-center">{{ props.item.fastestRun }}</td>
                <td class="text-xs-right">{{ props.item.solvedAt | unixTsToRelativeTime }}</td>
              </tr>
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
  import moment from 'moment'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    name: 'challenge-leaderboard-modal',
    data () {
      return {
        dialog: false,
        headers: [
          { text: '#', align: 'left', sortable: false, value: 'order' },
          { text: 'ID', align: 'left', sortable: true, value: 'uid' },
          { text: 'Language', align: 'center', sortable: true, value: 'language' },
          { text: 'Execution time (ms)', align: 'center', sortable: true, value: 'fastestRun' },
          { text: 'Solved At', align: 'center', sortable: true, value: 'solvedAt' }
        ],
        rows: [],
        pagination: {
          sortBy: 'fastestRun'
        }
      }
    },
    methods: {
      loadChallengeLeaderboard () {
        this.$axios.get(`${exeAddr}/api/v1/leaderboard/c/${this.$route.params.id}`, httpCfg)
          .then((result) => {
            this.rows = result.data
          })
          .catch((err) => {
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to get leaderboard: ${err}`})
          })
      },
      openUserProfile (uid) {
        window.open(`/users/${uid}`, '_blank')
      }
    },
    filters: {
      unixTsToRelativeTime (val) {
        return moment(val).fromNow()
      }
    },
    created () {
      eventBus.$on('showChallengeLeaderboardModal', () => {
        this.dialog = true
        this.loadChallengeLeaderboard()
      })
    }
  }
</script>
