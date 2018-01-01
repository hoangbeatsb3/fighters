import process from 'process'
import Vue from 'vue'
import dotenv from 'dotenv'
dotenv.config()

export const eventBus = new Vue({
  methods: {
    snackbarShown (data) {
      this.$emit('showSnackbar', data)
    },
    loginModalShown () {
      this.$emit('showLoginModal')
    },
    userLoggedIn () {
      this.$emit('loginUser')
    },
    logoutModalShown () {
      this.$emit('showLogoutModal')
    },
    userLoggedOut () {
      this.$emit('logoutUser')
    },
    challengeSolved () {
      this.$emit('solveChallenge')
    },
    challengeVersionsModalShown () {
      this.$emit('showChallengeVersionsModal')
    },
    challengeLeaderboardModalShown () {
      this.$emit('showChallengeLeaderboardModal')
    },
    versionCodeChanged (version) {
      this.$emit('changeVersionCode', version)
    },
    userProfileEditModalShown (user) {
      this.$emit('showUserProfileEditModal', user)
    },
    userProfileUpdated (user) {
      this.$emit('updateUserProfile', user)
    },
    settingsModalShown () {
      this.$emit('showSettingsModal')
    },
    drawerToggled (val) {
      this.$emit('forceToggleDrawer', val)
    }
  }
})

let https = require('https')
let cfg = {
  proxy: false,
  headers: {'Content-Type': 'application/json'}
}
if (process.env.EXECUTIONER_SSL_ENABLED === 'true') {
  cfg.httpsAgent = new https.Agent({
    rejectUnauthorized: false
  })
}
export const httpCfg = cfg

let levels = [
  {text: 'Veteran', xp: 0},
  {text: 'Swordsman', xp: 500},
  {text: 'Warrior', xp: 1500},
  {text: 'Champion', xp: 3000},
  {text: 'Hero', xp: 5000},
  {text: 'Legend', xp: 7500},
  {text: 'God of War', xp: 10500}
]

function romanize (num) {
  if (!+num) {
    return ''
  }
  let digits = String(+num).split('')
  let key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  let roman = ''
  let i = 3
  while (i--) {
    roman = (key[+digits.pop() + (i * 10)] || '') + roman
  }
  return Array(+digits.join('') + 1).join('M') + roman
}

function validate (lvl, xp) {
  if (!lvl || xp < 0) {
    return false
  }
  if (xp < levels[lvl - 1].xp) {
    return false
  }
  return true
}

export const level = {
  getTextLevel (lvl, xp) {
    if (!validate(lvl, xp)) {
      return 'Invalid'
    }
    let m = xp - levels[lvl - 1].xp
    let sl = Math.floor(m / (lvl * 100))
    return levels[lvl - 1].text + ' ' + romanize(sl + 1)
  },
  getPercLevel (lvl, xp) {
    if (!validate(lvl, xp)) {
      return 0
    }
    return level.getEarnedXPLevel(lvl, xp) / level.getNeededXPLevel(lvl, xp) * 100
  },
  getEarnedXPLevel (lvl, xp) {
    if (!validate(lvl, xp)) {
      return 0
    }
    let m = xp - levels[lvl - 1].xp
    let sl = Math.floor(m / (lvl * 100))
    return m - (sl * lvl * 100)
  },
  getNeededXPLevel (lvl, xp) {
    if (!validate(lvl, xp)) {
      return -1
    }
    return lvl * 100
  }
}
