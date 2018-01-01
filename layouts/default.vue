<template lang="pug">
  v-app(dark)
    v-navigation-drawer(
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="localDrawer"
      fixed
      app)
      v-list
        template(v-for="item in items")
          v-list-tile(v-if="!item.items" :key="item.title" :to='item.to')
            v-list-tile-action
              v-icon {{item.icon}}
            v-list-tile-content
              v-list-tile-title {{item.title}}
          v-list-group(v-else
            :prepend-icon='item.icon')
            v-list-tile(slot="activator" :key="item.title" :to='item.to')
              v-list-tile-content
                v-list-tile-title {{item.title}}
            v-list-tile(
              v-for="subItem in item.items"
              :key="subItem.title"
              :to="subItem.to")
              v-list-tile-action(v-if="subItem.icon")
                v-icon {{subItem.icon}}
              v-list-tile-content
                v-list-tile-title {{subItem.title}}
    v-toolbar(
      fixed
      app
      :clipped-left="clipped")
      v-toolbar-side-icon(@click="toggleDrawer")
      //- v-btn(
        icon
        @click.stop="miniVariant = !miniVariant")
        v-icon(v-html="miniVariant ? 'chevron_right' : 'chevron_left'")
      //- v-btn(
        icon
        @click.stop="clipped = !clipped")
        v-icon web
      //- v-btn(
        icon
        @click.stop="fixed = !fixed")
        v-icon remove
      v-toolbar-title(v-text="title")
      v-spacer
      v-menu.ma-3.hidden-sm-and-down(bottom left :nudge-bottom="45")
        v-avatar.grey.lighten-4(size="40" slot="activator")
          img(:src="menuAvatar" alt="avatar")
        v-list
          v-list-tile(v-for="(um, idx) in userMenu" :key="idx" @click="clickUserMenu(idx)" :disabled="um.disabled")
            v-icon {{ um.icon }} &nbsp;&nbsp;&nbsp;
            v-list-tile-title {{ um.text}}
          v-divider
          v-list-tile(@click="aboutPage")
            v-icon info_outline &nbsp;&nbsp;&nbsp;
            v-list-tile-title About
    v-content(class="fill-height")
      //- v-container(
      //-   fluid)
      nuxt
    //- v-navigation-drawer(
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed)
      v-list
        v-list-tile(@click.native="right = !right")
          v-list-tile-action
            v-icon(light) compare_arrows
          v-list-tile-title Switch drawer (click me)
    //- v-footer(
      :fixed="fixed"
      app)
      span &copy; 2017
    login-modal
    logout-modal
    settings-modal
    snackbar
</template>

<script>
  import LoginModal from '~/components/modals/LoginModal.vue'
  import LogoutModal from '~/components/modals/LogoutModal.vue'
  import SettingsModal from '~/components/modals/SettingsModal.vue'
  import Snackbar from '~/components/Snackbar.vue'
  import {eventBus} from '~/util/util'
  import {mapGetters, mapMutations} from 'vuex'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    components: {
      LoginModal,
      LogoutModal,
      SettingsModal,
      Snackbar
    },
    data () {
      return {
        clipped: true,
        fixed: true,
        localDrawer: false,
        menuAvatar: '',
        items: [
          { icon: 'apps', title: 'Welcome', to: '/' },
          { icon: 'school', title: 'Leaderboard', to: '/leaderboard' },
          {
            icon: 'whatshot',
            title: 'Arena',
            items: [
              { icon: 'code', title: 'Programming', to: '/arena/programming' },
              { icon: 'rowing', title: 'Testing', to: '/arena/testing' },
              { icon: 'school', title: 'Training', to: '/arena/training' }
            ]
          }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        userMenu: [
          {icon: 'phonelink', text: 'Login', disabled: false},
          {icon: 'keyboard_return', text: 'Logout', disabled: false},
          {icon: 'account_circle', text: 'Profile', disabled: false},
          {icon: 'settings', text: 'Settings', disabled: false}
        ]
      }
    },
    computed: {
      ...mapGetters(['title', 'drawer', 'authUser', 'avatar'])
    },
    watch: {
      'drawer' (val) {
        this.localDrawer = val
      },
      'avatar' (val) {
        this.getAvatarURL()
      },
      'authUser' (val) {
        this.setUserMenuStates(val)

        if (val && val.role === 1) {
          for (let i of this.items) {
            if (i.title === 'Administrator') {
              return
            }
          }
          this.items.push({ icon: 'widgets', title: 'Administrator', to: '/admin' })
          return
        }

        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].title === 'Administrator') {
            this.items.splice(i, 1)
            return
          }
        }
      }
    },
    methods: {
      ...mapMutations(['setDrawer']),
      clickUserMenu (idx) {
        if (!this.userMenu[idx].disabled) {
          switch (idx) {
            case 0: // Login
              eventBus.loginModalShown()
              return
            case 1: // Logout
              eventBus.logoutModalShown()
              return
            case 2: // Profile
              // location.href = `/users/${this.authUser.uid}`
              this.$router.push(`/users/${this.authUser.uid}`)
              return
            case 3: // Settings
              eventBus.settingsModalShown()
              return
            default:
              alert('Ba dum tss')
          }
        }
      },
      aboutPage () {
        this.$router.push('/about')
      },
      getAvatarURL () {
        if (!this.avatar) {
          this.menuAvatar = `${exeAddr}/api/v1/users/null/avatar`
          return
        }
        this.menuAvatar = `${exeAddr}${this.avatar}`
      },
      setUserMenuStates (val) {
        if (val) { // Already logged in
          this.userMenu[0].disabled = true // Login
          this.userMenu[1].disabled = false // Logout
          this.userMenu[2].disabled = false // Profile
          this.userMenu[3].disabled = false // Settings
          return
        }
        // Not login yet
        this.userMenu[0].disabled = false
        this.userMenu[1].disabled = true
        this.userMenu[2].disabled = true
        this.userMenu[3].disabled = true
      },
      toggleDrawer () {
        this.setDrawer(!this.drawer)
      }
    },
    created () {
      eventBus.$on('forceToggleDrawer', val => {
        this.localDrawer = val
      })
      this.localDrawer = this.drawer // Reflect from server set
      this.setUserMenuStates(this.authUser)
      this.getAvatarURL()

      if (this.authUser && this.authUser.role === 1) { // Administrator
        this.items.push({ icon: 'widgets', title: 'Administrator', to: '/admin' })
      }
    }
  }
</script>

<style>
.toolbar--fixed {
  z-index: 5;
}

.footer--fixed {
  z-index: 5;
}
</style>
