<template>
  <v-card light>
    <v-card-title primary-title>
      <h3 class="title headline mb-0">{{ challenge.title }}</h3>
    </v-card-title>
    <v-card-text class="mt-0 pt-0">
      <div class="meta">
        <v-icon small>stars</v-icon> {{ challenge.point }} points &nbsp;&nbsp;&nbsp;
        <span @click="showLeaderboard">
          <v-icon small>face</v-icon> Solved by {{ challenge.solvedBy }} {{ challenge.solvedBy > 1 ? 'people' : 'person' }}
        </span>
      </div>
      <div class="pt-2 meta-solved" v-if="solvedChallenge && solvedChallenge.isSolved">
        <v-icon small>check</v-icon> You solved this challenge <b>{{ solvedChallenge.solvedAt | unixTsToRelativeTime }}</b> with record of <b>{{ solvedChallenge.fastestRun }}ms</b> in <b>{{ solvedChallenge.language }}</b>.
      </div>
      <v-divider light class="mt-2 mb-3"></v-divider>
      <div v-html="marked(challenge.description || '')"></div>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from 'moment'
import marked from 'marked'
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

export default {
  props: [ 'challenge', 'solvedChallenge' ],
  methods: {
    showLeaderboard () {
      alert('Load leaderboard for this challenge')
    }
  },
  filters: {
    unixTsToRelativeTime (val) {
      return moment(val).fromNow()
    }
  }
}
</script>

<style>
  div.meta,
  div.meta > i,
  div.meta > span > i {
    font-size: 0.85rem;
    color: rgba(0,0,0,.61) !important;
  }

  div.meta > span {
    cursor: pointer;
  }

  div.meta-solved,
  div.meta-solved > i {
    font-size: 0.85rem;
    color: #4CAF50 !important;
  }
</style>
