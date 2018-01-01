<template lang="pug">
  v-container(v-if="!challenges || challenges.length === 0")
    v-layout.mt-5
      v-flex.sm-12.text-sm-center.mt-5
        v-icon.mb-2(large) sentiment_very_dissatisfied
        h2 No challenges data
  v-container(fluid grid-list-md v-else)
    v-layout(row wrap)
      v-flex(d-flex xs12 md4 sm6 v-for="it in challenges" :key='it.id')
        v-card(light d-flex align-end)
          v-card-title.title(primary style="height:60px") {{it.title}}
          v-card-text(
            style="height:190px; overflow: hidden; text-overflow: ellipsis;"
            v-html="marked((it.shortDesc || ''))")
          v-card-actions
            v-btn(:to="'/arena/testing/'+it.id" primary light router disabled) EAT IT!!!
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {eventBus, httpCfg} from '~/util/util'
let exeAddr = process.env.EXECUTIONER_ADDRESS

export default {
  data () {
    return {
      challenges: [],
      allChallenges: [],
      solvedChallenges: []
    }
  },
  computed: {
    ...mapGetters(['authUser']),
    isAuth () {
      return this.authUser && this.authUser.uid
    }
  },
  mounted () {
    // getting data
    // this.$axios.$get(`${exeAddr}/api/v1/apples`)
    //   .then((res) => {
    //     if (res) {
    //       this.apples = res
    //     }
    //   })
    //   .catch((err) => {
    //     this.bananas = []
    //     eventBus.snackbarShown({type: 'error', msg: 'Failed to load challanges: ' + err.message})
    //   })
  },
  methods: {
    ...mapMutations(['setTitle']),
    loadChallenges () {
      this.$axios.$get(`${exeAddr}/api/v1/qa/challenges`, httpCfg)
        .then((res) => {
          if (res) {
            this.allChallenges = res
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
      this.$axios.$get(`${exeAddr}/api/v1/solved/u/${this.authUser.uid}`, httpCfg)
        .then((res) => {
          if (res) {
            this.solvedChallenges = res
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
    }
  },
  watch: {
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
    this.setTitle('Testing')
    this.loadChallenges()
  }
}
</script>
