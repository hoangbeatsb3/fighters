<template>
  <v-container v-if="!rows || rows.length === 0">
    <v-layout class="mt-5">
      <v-flex class="sm-12 text-sm-center mt-5">
        <v-icon large class="mb-2">sentiment_very_dissatisfied</v-icon>
        <h2>No leaderboard data</h2>
      </v-flex>
    </v-layout>
  </v-container>

  <v-container grid-list-xl v-else>
    <h1 style="font-weight: 300">Legends</h1>
    <v-divider class="mt-2 mb-3"></v-divider>
    <!--TODO-->
    <v-layout class="v-align" style="min-height: 200px" justify-space-between>
      <v-flex class="xs4" v-if="rows && rows.length >= 2">
        <v-card color="deep-purple accent-3 elevation-15" @click.native="openUserProfile(rows[1].uid)" style="cursor: pointer" ripple>
          <v-card-title style="background-color: #6200EA" class="pt-2 pb-2">
            <span>#2</span>&nbsp;&nbsp;<h3>{{ rows[1].uid }}</h3>
            <v-spacer></v-spacer>
            <span>
              <i class="material-icons icon" style="font-size: 14px; margin-top: -3px;">stars</i>&nbsp;
              <span style="font-size: 1rem">{{ rows[1].cf.stats.xp }}</span>
            </span>
          </v-card-title>
          <v-card-text>
            <v-layout class="ma-0 pa-0 v-align">
              <v-flex class="sm4 pa-0 text-sm-center">
                <v-avatar size="60" class="white mb-1">
                  <img :src="rows[1].avatar | toAvatarURL" style="border: 1px solid #F5F5F5;"/>
                </v-avatar>
                <h4>{{ getTextLevel(rows[1].cf.level, rows[1].cf.stats.xp) }}</h4>
              </v-flex>
              <v-flex>
                <table style="text-align: left">
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">face</i>&nbsp;</td>
                    <td>{{ rows[1].name }}</td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">group</i>&nbsp;</td>
                    <td>{{ rows[1].groups[0] | toTeam }}</td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">location_city</i>&nbsp;</td>
                    <td>{{ rows[1].location }}</td>
                  </tr>
                </table>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="xs5" v-if="rows && rows.length >= 1">
        <v-card color="red accent-2 elevation-24" @click.native="openUserProfile(rows[0].uid)" style="cursor: pointer" ripple>
          <v-card-title style="background-color: #E53935" class="pt-2 pb-2">
            <span>#1</span>&nbsp;&nbsp;<h2>{{ rows[0].uid }}</h2>
            <v-spacer></v-spacer>
            <span>
              <i class="material-icons icon" style="font-size: 18px; margin-top: -4px;">stars</i>&nbsp;
              <span style="font-size: 1.2rem">{{ rows[0].cf.stats.xp }}</span>
            </span>
          </v-card-title>
          <v-card-text>
            <v-layout class="ma-0 pa-0 v-align">
              <v-flex class="sm5 pa-0 text-sm-center">
                <v-avatar size="80" class="white mb-1">
                  <img :src="rows[0].avatar | toAvatarURL" style="border: 1px solid #F5F5F5;"/>
                </v-avatar>
                <h4>{{ getTextLevel(rows[0].cf.level, rows[0].cf.stats.xp) }}</h4>
              </v-flex>
              <v-flex class="offset-sm1">
                <table style="text-align: left; border-spacing: 4px">
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 18px;">face</i>&nbsp;</td>
                    <td><h3>{{ rows[0].name }}</h3></td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 18px;">group</i>&nbsp;</td>
                    <td><h3>{{ rows[0].groups[0] | toTeam }}</h3></td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 18px;">location_city</i>&nbsp;</td>
                    <td><h3>{{ rows[0].location }}</h3></td>
                  </tr>
                </table>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="xs4" v-if="rows && rows.length >= 3">
        <v-card color="amber lighten-1 elevation-15" @click.native="openUserProfile(rows[2].uid)" style="cursor: pointer" ripple>
          <v-card-title style="background-color: #FFA000" class="pt-2 pb-2">
            <span>#3</span>&nbsp;&nbsp;<h3>{{ rows[2].uid }}</h3>
            <v-spacer></v-spacer>
            <span>
              <i class="material-icons icon" style="font-size: 14px; margin-top: -3px;">stars</i>&nbsp;
              <span style="font-size: 1rem">{{ rows[2].cf.stats.xp }}</span>
            </span>
          </v-card-title>
          <v-card-text>
            <v-layout class="ma-0 pa-0 v-align">
              <v-flex class="sm4 pa-0 text-sm-center">
                <v-avatar size="60" class="white mb-1">
                  <img :src="rows[2].avatar | toAvatarURL" style="border: 1px solid #F5F5F5;"/>
                </v-avatar>
                <h4>{{ getTextLevel(rows[2].cf.level, rows[2].cf.stats.xp) }}</h4>
              </v-flex>
              <v-flex>
                <table style="text-align: left">
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">face</i>&nbsp;</td>
                    <td>{{ rows[2].name }}</td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">group</i>&nbsp;</td>
                    <td>{{ rows[2].groups[0] | toTeam }}</td>
                  </tr>
                  <tr>
                    <td><i class="material-icons icon" style="font-size: 14px;">location_city</i>&nbsp;</td>
                    <td>{{ rows[2].location }}</td>
                  </tr>
                </table>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout class="mb-0 pb-0 mt-5">
      <v-flex class="mt-0 mb-0 pt-3 pb-0">
        <h1 style="font-weight: 300">Leaderboard</h1>
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex class="mt-0 mb-0 pt-0 pb-0 text-xs-right">
        <v-text-field
          append-icon="search"
          label="Search"
          single-line
          hide-details
          v-model="ldbSearch"
          style="display: inline-block; max-width: 250px"></v-text-field>
      </v-flex>
    </v-layout>
    <v-divider class="mt-2 mb-3"></v-divider>
    <v-layout>
      <v-flex class="sm12">
        <v-data-table
          v-bind:headers="headers"
          :items="rows"
          item-key="uid"
          v-bind:pagination.sync="pagination"
          v-bind:search="ldbSearch"
          :rows-per-page-items="rowsPerPageItems"
          class="elevation-10"
        >
          <!--Use slot-scope later-->
          <!--Refer to https://github.com/nuxt/nuxt.js/issues/2174 for more info -->
          <template slot="items" scope="props">
            <tr @click.stop="openUserProfile(props.item.uid)" style="cursor: pointer">
              <td>{{ props.index + 1 }}</td>
              <td class="text-xs-left">{{ props.item.uid }}</td>
              <td class="text-xs-left">{{ props.item.name }}</td>
              <td class="text-xs-left">{{ getTextLevel(props.item.cf.level, props.item.cf.stats.xp) }}</td>
              <td class="text-xs-left">{{ props.item.team ? props.item.team : props.item.groups[0] | toTeam }}</td>
              <td class="text-xs-left">{{ props.item.location }}</td>
              <td class="text-xs-left">{{ props.item.cf.stats.solved }}</td>
              <td class="text-xs-left">{{ props.item.cf.stats.xp }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {eventBus, httpCfg, level} from '~/util/util'
  import {mapMutations} from 'vuex'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    data () {
      return {
        headers: [
          { text: '#', align: 'left', sortable: false, value: 'order' },
          { text: 'ID', align: 'left', sortable: true, value: 'uid' },
          { text: 'Name', align: 'left', sortable: true, value: 'name' },
          { text: 'Level', align: 'left', sortable: true, value: 'cf.level' },
          { text: 'Team', align: 'left', sortable: false, value: 'team' },
          { text: 'Location', align: 'left', sortable: true, value: 'location' },
          { text: 'Solved', align: 'left', sortable: true, value: 'cf.stats.solved' },
          { text: 'XP', align: 'left', sortable: true, value: 'cf.stats.xp' }
        ],
        pagination: {
          sortBy: 'cf.stats.xp',
          descending: true
        },
        ldbSearch: '',
        rowsPerPageItems: [20, 50, 100, { text: 'All', value: -1 }],
        rows: []
      }
    },
    methods: {
      ...mapMutations(['setTitle', 'setDrawer']),
      loadLeaderboard () {
        this.$axios.get(exeAddr + '/api/v1/leaderboard', httpCfg)
          .then((result) => {
            this.rows = result.data

            // TODO: Remove these dummy data later
            let dummy = {
              uid: 'dummy',
              name: 'Dummy Person',
              team: 'Scooby-Doo',
              location: 'Eden',
              cf: {
                level: 1,
                stats: {
                  xp: 120,
                  solved: 3
                }
              }
            }
            for (let i = 0; i < 30; i++) {
              dummy.uid = 'dummy' + i
              let tmp = JSON.parse(JSON.stringify(dummy)) // Cloning
              this.rows.push(tmp)
            }
          })
          .catch(err => {
            console.log('ldb err', err)
            this.rows = []
            eventBus.snackbarShown({type: 'error', msg: 'Failed to load leaderboard: ' + err.message})
          })
      },
      openUserProfile (uid) {
        window.open(`/users/${uid}`, '_blank')
      },
      getTextLevel (lvl, xp) {
        console.log(lvl, xp)
        return level.getTextLevel(lvl, xp)
      }
    },
    filters: {
      toTeam (val) {
        if (!val) {
          return ''
        }
        let cns = val.split(',')
        return cns[0].trim().substring(cns[0].indexOf('=') + 1)
      },
      toAvatarURL (val) {
        return val ? `${exeAddr}${val}` : `${exeAddr}/api/v1/users/null/avatar`
      }
    },
    created () {
      this.setTitle('Leaderboard')
      this.loadLeaderboard()
    },
    mounted () {
      this.setDrawer(false)
      eventBus.drawerToggled(false)
    }
  }
</script>

<style scoped>
  .v-align {
    display: flex;
    align-items: center;
  }
</style>
