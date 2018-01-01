<template>
  <v-container>
    <v-card style="margin-top: 60px" v-if="user">
      <v-card-title primary-title>
        <span class="headline">&nbsp;</span>
        <v-avatar class="prf-avatar white" size="120">
          <img :src="user.avatar | toAvatarURL" alt="avatar">
        </v-avatar>
        <v-spacer></v-spacer>
        <v-tooltip top>
          <v-btn class="ma-0 pa-0" small fab flat color="success" slot="activator" v-if="authUser && authUser.uid === user.uid" @click="editProfile">
            <v-icon small>border_color</v-icon>
          </v-btn>
          <span>Edit my profile</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text class="pt-0">
        <v-layout>
          <v-flex class="xs8 offset-xs2 text-xs-center">
            <div style="padding-top: 10px">
              <span style="font-size: 2.5rem; font-weight: 600">{{ user.name }}</span><br>
            </div>
            <div v-if="user.about" style="padding-top: 8px">
              <span style="font-size: 1.3rem; font-weight: 300"><i>"{{ user.about }}"</i></span>
            </div>
            <div style="padding-top: 16px">
              <v-icon class="prf-meta-ico first" small v-if="user.uid">face</v-icon><span class="prf-meta">{{ user.uid }}</span>
              <v-icon class="prf-meta-ico" small v-if="user.email">mail</v-icon><span class="prf-meta">{{ user.email }}</span>
              <v-icon class="prf-meta-ico" small v-if="user.team">group</v-icon><span class="prf-meta">{{ user.team }}</span>
              <v-icon class="prf-meta-ico" small v-if="user.location">location_city</v-icon><span class="prf-meta">{{ user.location }}</span><br>
            </div>

            <div style="padding-top: 40px">
              <span style="font-weight: 300">Rank</span><br>
              <span style="font-size: 2rem; font-weight: 500">{{ getTextLevel(user.cf.level, user.cf.stats.xp) }}</span><br>
              <v-icon class="prf-rank-meta-ico first" small>stars</v-icon><span class="prf-rank-meta">{{ user.cf.stats.xp }}</span>
              <v-icon class="prf-rank-meta-ico" small>check_circle</v-icon><span class="prf-rank-meta">{{ user.cf.stats.solved }}</span><br>
              <span style="font-size: 0.8rem; font-weight: 300; float: right">{{ getEarnedXP(user.cf.level, user.cf.stats.xp) }}/{{ getNeededXP(user.cf.level, user.cf.stats.xp) }}</span>
              <v-progress-linear :value="getPercXP(user.cf.level, user.cf.stats.xp)" height="5" color="success"></v-progress-linear>
            </div>
          </v-flex>
        </v-layout>

        <v-layout class="pt-5"v-if="logs && logs.length > 0">
          <v-flex class="xs8 offset-xs2 text-xs-left">
            <h2>Battle logs</h2>
            <v-list class="pl-0">
              <v-list-tile avatar v-for="item in logs" :key="item._id" @click="toChallengePage(item.cid)">
                <v-list-tile-action>
                  <v-icon color="success">star</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{item.solvedAt | unixTsToRelativeTime}}</v-list-tile-title>
                  <span style="font-size: 1rem; font-weight: 300">Solved the {{item.cid}} challenge with record of {{item.fastestRun}}ms in {{item.language}}</span>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
    <user-profile-edit-modal></user-profile-edit-modal>
  </v-container>
</template>

<script>
  import {eventBus, httpCfg, level} from '~/util/util'
  import {mapGetters, mapMutations} from 'vuex'
  import UserProfileEditModal from '~/components/modals/UserProfileEditModal'
  import moment from 'moment'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    components: {
      UserProfileEditModal
    },
    data () {
      return {
        id: '',
        user: null,
        logs: []
      }
    },
    computed: {
      ...mapGetters(['authUser'])
    },
    methods: {
      ...mapMutations(['setTitle', 'setDrawer']),
      loadUserProfile () {
        this.$axios.get(`${exeAddr}/api/v1/users/${this.id}`, httpCfg)
          .then((result) => {
            this.user = result.data
          })
          .catch((err) => {
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to get user profile: ${err}`})
          })
      },
      loadSolvedChallenges () {
        this.$axios.get(`${exeAddr}/api/v1/solved/u/${this.$route.params.id}`, httpCfg)
          .then((res) => {
            if (res) {
              this.logs = res.data.sort((a, b) => {
                return a.solvedAt < b.solvedAt
              })
            }
          })
          .catch((err) => {
            console.error('Error getting solved data', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to load solved challenges: ${err}`})
          })
      },
      editProfile () {
        eventBus.userProfileEditModalShown(this.user)
      },
      toChallengePage (val) {
        window.open(`/arena/programming/${val}`, '_blank') // TODO: Testing URL?
      },
      getTextLevel (lvl, xp) {
        return level.getTextLevel(lvl, xp)
      },
      getEarnedXP (lvl, xp) {
        return level.getEarnedXPLevel(lvl, xp)
      },
      getNeededXP (lvl, xp) {
        return level.getNeededXPLevel(lvl, xp)
      },
      getPercXP (lvl, xp) {
        return level.getPercLevel(lvl, xp)
      }
    },
    filters: {
      toAvatarURL (val) {
        return val ? `${exeAddr}${val}` : `${exeAddr}/api/v1/users/null/avatar`
      },
      unixTsToRelativeTime (val) {
        return moment(val).fromNow()
      }
    },
    created () {
      eventBus.$on('userProfileUpdated', user => {
        this.user = JSON.parse(JSON.stringify(user))
      })
    },
    mounted () {
      if (!this.$route.params.id) {
        location.href = '/users'
        return
      }
      this.setDrawer(false)
      eventBus.drawerToggled(false)
      this.id = this.$route.params.id
      this.setTitle(`Profile / ${this.id}`)
      this.loadUserProfile()
      this.loadSolvedChallenges()
    }
  }
</script>

<style scoped>
  .prf-avatar {
    margin: auto;
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
  }
  .prf-avatar > img {
    border: 2px solid #F5F5F5;
  }
  .prf-meta {
    font-size: 1.2rem;
    color: rgba(255,255,255, .61)
  }
  .prf-meta-ico {
    margin: -4px 5px 0 20px;
    color: rgba(255,255,255, .61)
  }
  .prf-meta-ico.first {
    margin: -4px 5px 0 0;
  }
  .prf-rank-meta {
    font-size: 1.2rem;
    color: rgba(255,255,255,.91)
  }
  .prf-rank-meta-ico {
    margin: -4px 5px 0 20px;
    color: rgba(255,255,255,.91)
  }
  .prf-rank-meta-ico.first {
    margin: -4px 5px 0 0;
  }
</style>
