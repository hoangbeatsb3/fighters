<template>

<v-container grid-list-md text-xs-center>
  <v-layout row wrap>
    <v-flex d-flex xs12 sm3 md5>
      <v-card>
        <v-card-media src="/course01.jpeg" height="200px">
        </v-card-media>
        <v-card-title>
          <div>
            <h3 style="float: left; color: #66cc99;"> Time: 10:00 - 12:00</h3>
            <h3 style="float: right; color: #66cc99;">Date: 2017-10-12</h3>
            
            <v-card-actions style="float: left; width: 100%;">
              <!-- <h3 class="headline mb-0" style="float: left; color: orange;">Angular JS JS</h3> -->
              <!-- <v-btn outline color="amber">Vote</v-btn> -->
            </v-card-actions>
            <h3 class="headline mb-0" style="float: left; color: orange; margin-top: 2%;">{{ this.$route.params.id }}</h3>
            <v-btn @click="vote()" outline color="amber">Vote</v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <div style="color: #e6e6e6; font-size: 11pt; float: left;">
            Make your code flexible. Comfortable with GO Get out of your world, take it - a new world of code ...<br>
            Make your dream come true ...
            Make your code flexible. Comfortable with GO Get out of your world, take it - a new world of code ...<br>
            Make your dream come true ...
            Make your code flexible. Comfortable with GO Get out of your world, take it - a new world of code ...<br>
            Make your dream come true ...
            Make your code flexible. Comfortable with GO Get out of your world, take it - a new world of code ...<br>
            Make your dream come true ...
            Make your code flexible. Comfortable with GO Get out of your world, take it - a new world of code ...<br>
            Make your dream come true ...
          </div>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex d-flex xs12 sm3 md7>
        <v-data-table
          v-bind:headers="headers"
          :items="items"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.email }}</td>
          </template>
        </v-data-table>
    </v-flex>
  </v-layout>
</v-container>
</template>

<<script>
import {eventBus, httpCfg} from '~/util/util'
import axios from 'axios'

export default {
  data () {
    return {
      headers: [
        { text: 'Name', value: 'name', align: 'center' },
        { text: 'Email', value: 'email', align: 'center', sortable: 'false' }
      ],
      items: []
    }
  },
  mounted (params) {
  // getting data
    this.$axios.$get(`http://localhost:8088/courses/` + this.$route.params.id, httpCfg)
      .then((res) => {
        if (res) {
          this.items = res[0].participant
        }
      })
      .catch((err) => {
        console.error('Error getting data', err)
        eventBus.snackbarShown({type: 'error', msg: `Failed to load course ${err}`})
      })
  },
  methods: {
    fetchData () {
      this.$axios.$get(`http://localhost:8088/courses/` + this.$route.params.id, httpCfg)
        .then((res) => {
          if (res) {
            this.items = res[0].participant
          }
        })
        .catch((err) => {
          console.error('Error getting data', err)
          eventBus.snackbarShown({type: 'error', msg: `Failed to load course ${err}`})
        })
    },
    vote () {
      axios.post('http://localhost:8088/courses/vote', {
        Name: this.$route.params.id,
        Participant: [
          {
            Name: 'vote',
            Email: 'vote@gmail.com'
          }
        ]
      }, httpCfg)
        .then((res) => {
          this.fetchData()
          eventBus.snackbarShown({type: 'success', msg: `Vote successfully`})
        })
        .catch((err) => {
          eventBus.snackbarShown({type: 'error', msg: `Failed to vote: ${err}`})
        })
    }
  }
}
</script>