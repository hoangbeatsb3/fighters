<template>
  <v-container>
    <v-layout>
      <v-flex class="xs12">
        <v-card>
          <v-card-text>
            <div v-html="marked(aboutText)"></div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {eventBus} from '~/util/util'
  import {mapMutations} from 'vuex'

  export default {
    data () {
      return {
        aboutText: `# CodeFights
CodeFights is an online arena for solving coding problems. [Bla bla bla...]

Source code: [https://gitlab.com/fighters-solution](https://gitlab.com/fighters-solution).

### CONTRIBUTORS

- [Vu To](/users/tntvu) - tntvu@tma.com.vn
- [Quy Le](/users/lnquy) - lnquy@tma.com.vn
- ...

### LICENSE

This project is under the MIT License.
        `
      }
    },
    methods: {
      ...mapMutations(['setTitle', 'setDrawer'])
    },
    mounted () {
      this.setDrawer(false)
      eventBus.drawerToggled(false)
      this.setTitle('About')
    }
  }
</script>

