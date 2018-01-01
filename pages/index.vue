<template lang="pug">
  v-container(fluid grid-list-md pa-3)
    template(v-if="this.leagues && this.leagues.length")
      h1(style="font-weight: 300") Leagues
      v-divider(class="mb-3 mt-2")
      v-layout(row wrap justify-center)
        v-flex(d-flex highlight v-for="l in leagues" :key='l._id')
          v-card(dark ripple slot="header")
            v-card-media.white--text(height='450px', :src='l.banner')
              v-container(fill-height fluid)
                v-layout(fill-height)
                  v-flex(xs12 align-end flexbox)
                    span.display-3.unselectable(style="text-shadow: 3px 3px #000000") {{l.title}}
            v-card-actions
              countdown.h1(:time='timeCalculate(l.start)')
                template(scope='props') {{ props.days }} days, {{ props.hours }} hours, {{ props.minutes }} minutes, {{ props.seconds }} seconds.
              v-spacer
              v-btn join
</template>

<script>
  import {mapMutations} from 'vuex'
  import {httpCfg} from '~/util/util'
  import Countdown from '@xkeshi/vue-countdown'
  import moment from 'moment'

  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    components: { Countdown },
    data () {
      return {
        leagues: []
      }
    },
    methods: {
      ...mapMutations(['setTitle']),
      loadLeagues () {
        this.$axios.get(`${exeAddr}/api/v1/leagues`, httpCfg)
          .then((res) => {
            this.leagues = res.data
          })
          .catch((err) => {
            // ignored
            console.error(err)
          })
      },
      timeCalculate (start) {
        if (moment(start).isAfter(moment())) {
          return moment(start).toDate() - moment().toDate()
        }
        return 0
      }
    },
    created () {
      this.setTitle('Welcome')
      this.loadLeagues()
    }
  }
</script>
