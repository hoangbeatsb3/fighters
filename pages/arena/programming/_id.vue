<template lang="pug">
  v-container(fluid fill-height)
    v-layout(row mt5 v-if="!challenge")
      v-flex(xs12 text-sm-center mt-5)
        v-icon(large mb-2) sentiment_very_dissatisfied
        h2 No challenge data
    v-layout(row wrap v-else)
      v-flex(d-flex xs12 md5 v-show="instructionPanel")
        instruction-panel(:challenge='challenge' :solvedChallenge='solvedChallenge')
      v-flex(d-flex xs12 :class="{ 'md7': instructionPanel, 'md12': !instructionPanel }")
        solution-panel(:challenge='challenge' :solvedChallenge='solvedChallenge')
    challenge-leaderboard-modal
    challenge-versions-modal
</template>

<script>
import InstructionPanel from '~/components/programming/InstructionPanel'
import SolutionPanel from '~/components/programming/SolutionPanel'
import ChallengeLeaderboardModal from '~/components/modals/ChallengeLeaderboardModal'
import ChallengeVersionsModal from '~/components/modals/ChallengeVersionsModal'

import {eventBus, httpCfg} from '~/util/util'
import {mapGetters, mapMutations} from 'vuex'

let exeAddr = process.env.EXECUTIONER_ADDRESS

export default {
  components: {
    ChallengeLeaderboardModal,
    ChallengeVersionsModal,
    InstructionPanel,
    SolutionPanel
  },
  data () {
    return {
      challenge: null,
      solvedChallenge: null
    }
  },
  computed: {
    ...mapGetters(['instructionPanel', 'authUser']),
    isAuth () {
      return this.authUser && this.authUser.uid
    }
  },
  methods: {
    ...mapMutations(['setTitle', 'setDrawer']),
    loadChallenge () {
      if (!this.$route.params.id) {
        return
      }
      this.$axios.get(`${exeAddr}/api/v1/dev/challenges/${this.$route.params.id}`, httpCfg)
        .then((res) => {
          // console.log(res)
          this.challenge = res.data
          this.setTitle(`Programming / ${this.challenge.title}`)
          this.loadIsSolvedChallenge()
        }).catch((err) => {
          this.challenge = null
          console.log(err)
          eventBus.snackbarShown({type: 'error', msg: `Failed to load challenge: ${err}`})
        })
    },
    loadIsSolvedChallenge () {
      if (!this.$route.params.id || !this.isAuth) {
        return
      }
      this.$axios.get(`${exeAddr}/api/v1/solved/u/${this.authUser.uid}/c/${this.$route.params.id}`, httpCfg)
        .then((res) => {
          this.solvedChallenge = res.data
        }).catch((err) => {
          this.solvedChallenge = null
          console.log(err)
          eventBus.snackbarShown({type: 'error', msg: `Failed to load solved challenge: ${err}`})
        })
    }
  },
  created () {
    eventBus.$on('loginUser', () => {
      this.loadIsSolvedChallenge() // Refresh solved status
    })
    eventBus.$on('logoutUser', () => {
      this.solvedChallenge = null
    })
    eventBus.$on('solveChallenge', (id) => {
      this.loadChallenge() // Reload challenge's solvedBy and its user solved challenge meta
    })
    this.loadChallenge()
  },
  mounted () {
    this.setDrawer(false)
    eventBus.drawerToggled(false)
    if (!this.authUser || !this.authUser.uid) {
      eventBus.loginModalShown() // Force login first
    }
  }
}
</script>
