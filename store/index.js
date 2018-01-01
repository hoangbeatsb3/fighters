let defaultSettings = {
  language: 'c',
  hideSolved: false,
  editor: {
    theme: 'monokai',
    fontSize: '16px'
  }
}

export const state = () => ({
  title: 'Welcome',
  drawer: false,
  avatar: '',
  authUser: null,
  instructionPanel: true,
  settings: defaultSettings
})

export const getters = {
  title: (state) => {
    return state.title
  },
  drawer: (state) => {
    return state.drawer
  },
  avatar: (state) => {
    return state.avatar
  },
  authUser: (state) => {
    return state.authUser
  },
  instructionPanel: (state) => {
    return state.instructionPanel
  },
  settings: (state) => {
    return state.settings
  }
}

export const mutations = {
  setTitle (state, title) {
    state.title = title
  },
  setDrawer (state, v) {
    state.drawer = v
    if (!document) {
      return
    }
    document.cookie = 'cf_states=' + (Buffer.from(JSON.stringify({drawer: state.drawer, avatar: state.avatar})).toString('base64')) + ';path=/'
  },
  setDrawerServer (state, v) {
    state.drawer = v
  },
  setAvatar (state, v) {
    state.avatar = v
    if (!document) {
      return
    }
    document.cookie = 'cf_states=' + (Buffer.from(JSON.stringify({drawer: state.drawer, avatar: state.avatar})).toString('base64')) + ';path=/'
  },
  setAvatarServer (state, v) {
    state.avatar = v
  },
  setAuthUser (state, user) {
    state.authUser = user
  },
  toggleInstructionPanel (state) {
    state.instructionPanel = !state.instructionPanel
  },
  setSettingsServer (state, v) {
    state.settings = v
  },
  setSettings (state, v) {
    state.settings = v
    if (!document) {
      return
    }
    if (v) {
      document.cookie = 'cf_settings=' + (Buffer.from(JSON.stringify(v)).toString('base64')) + ';path=/'
    }
  },
  setSettingsToDefault (state) {
    state.settings = defaultSettings
    if (!document) {
      return
    }
    document.cookie = 'cf_settings=' + (Buffer.from(JSON.stringify(defaultSettings)).toString('base64')) + ';path=/'
  }
}

function parseCookies (req) {
  let list = {}
  let rc = req.headers.cookie
  rc && rc.split(';').forEach(cookie => {
    let parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })
  return list
}

export const actions = {
  // nuxtServerInit is called by Nuxt.js before server-rendering every page
  nuxtServerInit ({ commit }, { req }) {
    // Session
    if (!req.session) {
      return
    }
    if (req.session.user) {
      commit('setAuthUser', req.session.user)
    }

    // Cookie
    let cookies = parseCookies(req)
    if (!cookies || cookies.length === 0) {
      return
    }
    let st = {drawer: false, avatar: ''}
    try {
      if (cookies.cf_states) {
        st = JSON.parse(Buffer.from(cookies.cf_states, 'base64').toString('utf-8'))
      }
    } catch (err) {
      console.log('SESSION ERR', err)
    }
    commit('setDrawerServer', st.drawer)
    commit('setAvatarServer', st.avatar)

    let s = defaultSettings
    try {
      if (cookies.cf_settings) {
        s = JSON.parse(Buffer.from(cookies.cf_settings, 'base64').toString('utf-8'))
      }
    } catch (err) {
      console.log('SESSION ERR', err)
    }
    commit('setSettingsServer', s)
  }
}
