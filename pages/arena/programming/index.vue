<template lang="pug">
  v-container(fluid grid-list-md pa-3)
    v-layout
      v-flex(xs6)
        h1(style="font-weight: 300") Challenges
      v-spacer
      v-flex(xs1)
        v-tooltip(top)
          v-switch(v-model='swHideSolved' color='info' style="width: 20px; float: right; margin-bottom: -15px padding-top: 10px; padding-bottom: 0" :disabled="!isAuth" slot="activator")
          span {{ swHideSolved ? 'Show' : 'Hide' }} all solved challenges
    v-divider(class="mb-3 mt-1")
    v-layout(row wrap)
      v-flex(d-flex xs12 md4 sm6 highlight v-for="c in challenges" :key='c._id')
        v-card(dark ripple :to="getLink(c)" router)
          v-card-title.title(primary) {{ c.title }}
          v-card-text(
            v-html="marked((c.shortDesc || ''))")
          v-card-actions
            <span class="card-meta">
              <v-icon small>stars</v-icon> {{ c.point }} &nbsp;&nbsp;&nbsp;
              <v-icon small>face</v-icon> {{ c.solvedBy }}
            </span>
            v-spacer
            <v-icon color="green accent-4" v-if="isSolved(c._id)">check</v-icon>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import {eventBus, httpCfg} from '~/util/util'

  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    // middleware: 'auth', // Uncomment to require login before loading this page
    data () {
      return {
        swHideSolved: false,
        challenges: [],
        allChallenges: [],
        solvedChallenges: []
      }
    },
    computed: {
      ...mapGetters(['authUser', 'settings']),
      isAuth () {
        return this.authUser && this.authUser.uid
      }
    },
    methods: {
      ...mapMutations(['setTitle']),
      loadChallenges () {
        this.$axios.get(`${exeAddr}/api/v1/dev/challenges`, httpCfg)
          .then((res) => {
            if (res) {
              this.allChallenges = res.data
              this.loadSolvedChallenges()
            }
          })
          .catch((err) => {
            console.error('Error getting data', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to load challenges: ${err}`})
          })
      },
      loadSolvedChallenges () {
        if (!this.isAuth) { // Only load solved challenges for logged in user
          return
        }
        this.$axios.get(`${exeAddr}/api/v1/solved/u/${this.authUser.uid}`, httpCfg)
          .then((res) => {
            if (res) {
              this.solvedChallenges = res.data
            }
          })
          .catch((err) => {
            console.error('Error getting solved data', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to load solved challenges: ${err}`})
          })
      },
      refreshChallenges () {
        this.challenges = JSON.parse(JSON.stringify(this.allChallenges)) // Cloning instead of referencing
        if (!this.swHideSolved) {
          return
        }
        // Remove solved items from showing list
        for (let sc of this.solvedChallenges) {
          for (let i = 0; i < this.challenges.length; i++) {
            if (sc.isSolved && this.challenges[i]._id === sc.cid) {
              this.challenges.splice(i, 1)
            }
          }
        }
      },
      isSolved (val) {
        for (let sc of this.solvedChallenges) {
          if (sc.cid === val) {
            return true
          }
        }
        return false
      },
      getLink (c) {
        return c.disabled === true ? '' : '/arena/programming/' + c._id
      }
    },
    watch: {
      settings (val) {
        if (val) {
          this.swHideSolved = val.hideSolved
        }
      },
      swHideSolved (val) {
        this.refreshChallenges()
      },
      solvedChallenges (val) {
        this.refreshChallenges()
      },
      allChallenges (val) {
        this.refreshChallenges()
      }
    },
    created () {
      eventBus.$on('loginUser', () => {
        this.loadSolvedChallenges() // Refresh solved list
      })
      eventBus.$on('logoutUser', () => {
        this.solvedChallenges = []
      })
      this.setTitle('Programming')
      this.loadChallenges()
      this.swHideSolved = JSON.parse(JSON.stringify(this.settings.hideSolved))
    }
  }
</script>

<style>
  span.card-meta,
  span.card-meta > i {
    color: rgba(255,255,255,.61) !important;
  }

  .highlight > a:hover,
  .highlight > a:focus,
  .highlight > a:active {
    -webkit-box-shadow:inset 0 0 0 2px #00E676;
    -moz-box-shadow:inset 0 0 0 2px #00E676;
    box-shadow:inset 0 0 0 2px #00E676;
  }

  .unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .no-padding {
    padding: 0;
  }
</style>
