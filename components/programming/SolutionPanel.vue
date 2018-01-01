<template lang="pug">
  v-layout(fill-height v-bind='{column: true}')
    v-toolbar
      v-tooltip(top class="ml-0")
        v-btn(flat fab small @click.stop="toggleInstructionPanel" slot="activator")
          v-icon {{ toggleInstructionIcon }}
        span Toggle instruction panel
      v-spacer
      v-select(
        :items='languages'
        v-model='slLanguage'
        :prepend-icon='langIcon()'
        single-line
        solo
        dense
        class="sl-lang"
        style="max-width: 220px")
        template(slot='item' scope='data')
          v-list-tile-avatar
            v-icon(small) {{ langIcon(data.item) }}
          v-list-tile-content(v-text='data.item')
      v-menu(bottom left)
        v-btn(flat fab small slot="activator")
          v-icon more_vert
        v-list
          v-list-tile(v-for="(item, idx) in solutionMenu" :key="item.title" @click="clickSolutionMenu(idx)")
            v-list-tile-title
              v-icon {{ item.icon }} &nbsp;&nbsp;&nbsp;
              | {{ item.title }}
    v-flex(style="width: 100%; height: 100%")
      no-ssr(placeholder="Code editor is loading")
        brace(style="height:100%"
          :value='currentTemplate'
          :fontsize="editor.fontSize"
          :theme="editor.theme"
          :mode="editorMode()"
          :codefolding="'markbegin'"
          :softwrap="'free'"
          :selectionstyle="'text'"
          :highlightline="true"
          @codeChange='updateCode')
    v-flex
      v-card
        v-card-actions
          v-btn(flat fab small @click.stop="toggleConsolePanel")
            v-icon {{ toggleConsoleIcon }}
          h3 Console
          h3(v-if="successMsg || errorMsg" ) |
          h3(v-if="successMsg" style="color: #00C853") Success
          h3(v-if="errorMsg" style="color: #D50000") Error
          v-spacer
          v-tooltip(top :disabled="isAuth")
            v-btn(color='info' @click.stop='testCode' :disabled='!isAuth || disableTest || loadingTest' :loading='loadingTest' slot='activator') Test
            span Please login first
          v-tooltip(top :disabled="isAuth")
            v-btn(color='success' @click.stop='submitCode' :disabled='!isAuth || disableSubmit || loadingSubmit' :loading='loadingSubmit' slot='activator') Submit
              v-icon(right dark) cloud_upload
            span Please login first
    v-flex(v-if="console")
      div(class="console")
        pre(v-if='!errorMsg && !successMsg') No output yet. Please run test or submit your solution first!
        pre(v-if='errorMsg') {{ errorMsg }}
        pre(v-if='successMsg') {{ successMsg }}
        div(style="position: absolute; right: 10px; bottom: 10px;" v-if="console && (errorMsg || successMsg)")
          v-tooltip(top)
            v-btn(fab flat small class="mr-3" color='error' @click.stop='clearConsole' slot="activator")
              v-icon(small) delete
            span Clear console
</template>

<script>
import {eventBus, httpCfg} from '~/util/util'
import {mapGetters, mapMutations} from 'vuex'

let exeAddr = process.env.EXECUTIONER_ADDRESS

export default {
  props: [ 'challenge', 'solvedChallenge' ],
  data () {
    return {
      editor: {
        language: null, // 'c',
        code: '',
        fontSize: '16px',
        theme: 'monokai'
      },
      slLanguage: null, // 'C',
      toggleInstructionIcon: 'first_page',
      console: false,
      toggleConsoleIcon: 'expand_more',
      errorMsg: '',
      successMsg: '',
      solutionMenu: [
        { icon: 'school', title: 'Leaderboard' },
        { icon: 'history', title: 'Solution history' }
      ],
      loadingTest: false,
      disableTest: false,
      loadingSubmit: false,
      disableSubmit: false,
      currentTemplate: '',
      currentFixture: ''
    }
  },
  computed: {
    ...mapGetters(['instructionPanel', 'authUser', 'settings']),
    isAuth () {
      return this.authUser && this.authUser.uid && true // Need && true here to force boolean type
    },
    languages () {
      return (this.challenge.data || [])
        .sort((a, b) => {
          return a.language > b.language
        })
        .map((s) => {
          return s.language[0].toUpperCase() + s.language.substring(1)
        })
    }
  },
  watch: {
    'settings' (val) {
      let s = JSON.parse(JSON.stringify(val))
      this.editor.fontSize = s.editor.fontSize
      this.editor.theme = s.editor.theme
      this.changeEditorLanguage(s.language)
    },
    slLanguage (val) {
      if (val) {
        this.editor.language = val.toLowerCase()
      }
    },
    instructionPanel (val) {
      this.toggleInstructionIcon = val ? 'first_page' : 'last_page'
    },
    console (val) {
      this.toggleConsoleIcon = val ? 'expand_less' : 'expand_more'
    },
    'editor.language' (val) {
      let sol = (this.challenge.data || []).find((s) => {
        return s.language === val
      })
      this.currentTemplate = (sol || {}).template
    }
  },
  methods: {
    ...mapMutations(['toggleInstructionPanel']),
    editorMode () {
      let trans
      switch (this.editor.language) {
        case 'c':
        case 'cpp':
          trans = 'c_cpp'
          break
        case 'go':
          trans = 'golang'
          break
        case 'python3':
          trans = 'python'
          break
        default:
          trans = this.editor.language
      }
      return trans
    },
    langIcon (lan) {
      let l = lan || this.editor.language
      if (l) {
        l = l.toLowerCase()
        let trans
        switch (l) {
          case 'go':
            trans = 'go-lang'
            break
          case 'python3':
            trans = 'python'
            break
          case 'c':
            trans = 'c-lang'
            break
          case 'cpp':
            trans = 'cplusplus'
            break
          default:
            trans = l
        }
        return `rye-${trans}`
      }
      return null
    },
    changeEditorLanguage (lang) {
      for (let l of this.languages) {
        if (l.toLowerCase() === lang) { // The template is available for default language
          this.slLanguage = lang[0].toUpperCase() + lang.substring(1)
          return
        }
      }
      this.slLanguage = this.languages[0] // Default to first supported language
    },
    updateCode (val) {
      this.editor.code = val
    },
    toggleConsolePanel () {
      this.console = !this.console
    },
    clearConsole () {
      this.errorMsg = ''
      this.successMsg = ''
      this.console = false
    },
    clickSolutionMenu (idx) {
      switch (idx) {
        case 0: // Leaderboard
          eventBus.challengeLeaderboardModalShown()
          break
        case 1: // Versioning
          eventBus.challengeVersionsModalShown()
          break
      }
    },
    testCode () {
      // console.log(JSON.stringify(this.editor.code))
      this.errorMsg = ''
      this.successMsg = ''
      this.loadingTest = true
      this.disableSubmit = true

      // Run test with pre-defined fixture
      this.$axios.post(`${exeAddr}/api/v1/dev/fighters/test`, {
        cid: this.$route.params.id,
        language: this.editor.language,
        code: this.editor.code
      }, httpCfg)
        .then((result) => {
          // console.log(result)
          result = result.data
          this.loadingTest = false
          this.disableSubmit = false
          this.console = true
          if (result.failed) {
            this.errorMsg = result.stderr
            return
          }
          this.successMsg = result.stdout
        })
        .catch((err) => {
          console.log(err)
          eventBus.snackbarShown({type: 'error', msg: `Failed to test: ${err}`})
          this.errorMsg = `Failed to test: ${err}. \nPlease contact administrator if you repeatedly see this error.`
          this.loadingTest = false
          this.disableSubmit = false
          this.console = true
        })
    },
    submitCode () {
      // console.log(JSON.stringify(this.editor.code))
      this.errorMsg = ''
      this.successMsg = ''
      this.loadingSubmit = true
      this.disableTest = true

      // Run test with pre-defined fixture
      this.$axios.post(`${exeAddr}/api/v1/dev/fighters/u/${this.authUser.uid}/fight`, {
        cid: this.$route.params.id,
        language: this.editor.language,
        code: this.editor.code
      }, httpCfg)
        .then((result) => {
          console.log(result)
          result = result.data
          this.loadingSubmit = false
          this.disableTest = false
          this.console = true
          if (result.failed) {
            this.errorMsg = result.stderr
            return
          }
          this.successMsg = result.stdout
          if (!result.isUserUpdated) {
            return
          }
          // Reload solved challenges and user details
          eventBus.challengeSolved()
        })
        .catch((err) => {
          console.log(err)
          eventBus.snackbarShown({type: 'error', msg: `Failed to submit solution: ${err}`})
          this.errorMsg = `Failed to submit solution: ${err}. \nPlease contact administrator if you repeatedly see this error.`
          this.loadingSubmit = false
          this.disableTest = false
          this.console = true
        })
    }
  },
  created () {
    eventBus.$on('changeVersionCode', (version) => {
      this.slLanguage = version.language
      setTimeout(() => {
        this.currentTemplate = version.code
      }, 50) // Let the default template be loaded first, then changes the version code
    })

    setTimeout(() => {
      let s = JSON.parse(JSON.stringify(this.settings))
      this.editor.fontSize = s.editor.fontSize
      this.editor.theme = s.editor.theme
      this.changeEditorLanguage(s.language)
    }, 50)
  },
  mounted () {
    // default template
    this.currentTemplate = ((this.challenge.data || []).find((s) => {
      return s.language === this.editor.language
    }) || {}).template

    setTimeout(() => {
      this.editor.fontSize = '16px'
    }, 50) // Delay so brace can re-render at client side
  }
}
</script>

<style scoped>
  .solution {
    border-radius: 5px;
    padding: 5px;
  }

  .runerror.info, .runok.success {
    border-radius: 5px;
    margin: 1rem;
    padding: 1rem;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }

  .console {
    background-color: black;
    font-family: "Courier New", Courier, monospace;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    font-size: 13px;
  }
</style>
