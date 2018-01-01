<template>

<v-container grid-list-md text-xs-center>
  <v-layout row wrap >
    <div style="width: 100%; height: auto;">
      <v-form v-model="valid" ref="form" lazy-validation v-if="seen">
          <v-text-field
            label="Name"
            v-model="name"
            :rules="nameRules"
            :counter="10"
            required
          ></v-text-field>

          <v-btn
            @click="submit"
            :disabled="!valid"
          >
            submit
          </v-btn>
          <v-btn @click="clear">clear</v-btn>
        </v-form>

      <v-btn v-on:click='seen = !seen' outline color="amber" style="float:right;">Add Course</v-btn>
        
    </div>
    <v-flex d-flex xs12 sm3 md4 style="height: auto;" v-for="item in items" :key='item.name'>
              <v-card>
                <v-card-media src="/course01.jpeg" height="200px">
                </v-card-media>
                <v-card-title primary-title>
                  <div>
                    <h3 class="headline mb-0" style="color: #ccff99;"> {{ item.name }}</h3>
                  </div>
                </v-card-title>
                <v-card-text>
                  <div>
                    Make your code flexible. Comfortable with GO <br>Get out of your world, take it - a new world of code ...<br>
                    Make your dream come true ...
                  </div>
                </v-card-text>
                <v-card-actions style="float:right;">
                  <v-btn @click="vote(item.name)" outline color="amber">Vote</v-btn>
                  <v-btn v-bind:href="'/arena/training/'+ item.name" outline color="orange"> Detail</v-btn>
                </v-card-actions>   
              </v-card>
            
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
  import axios from 'axios'
  // import mapGetters from 'vuex'
  import {eventBus, httpCfg} from '~/util/util'

  // let goAddr = process.env.GO_ADDRESS

  export default {
    data () {
      return {
        items: [],
        seen: false,
        valid: true,
        name: '',
        nameRules: [
          (v) => !!v || 'Name is required'
        ]
      }
    },
    // computed: {
    //   ...mapGetters(['authUser', 'settings']),
    //   isAuth () {
    //     return this.authUser && this.authUser.uid
    //   }
    // },
    mounted () {
      this.$axios.$get(`http://localhost:8088/courses`, httpCfg)
        .then((res) => {
          if (res) {
            this.items = res
          }
        })
        .catch((err) => {
          eventBus.snackbarShown({type: 'error', msg: `Failed to get data: ${err}`})
        })
    },
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          axios.post('http://localhost:8088/courses/new', {
            Name: this.name
          }, httpCfg)
            .then((res) => {
              this.fetchData()
              eventBus.snackbarShown({type: 'success', msg: `Add new course successfully`})
            })
        }
      },
      fetchData () {
        this.$axios.$get(`http://localhost:8088/courses`, httpCfg)
          .then((res) => {
            if (res) {
              this.items = res
            }
          })
          .catch((err) => {
            console.error('Error getting data', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to get data: ${err}`})
          })
      },
      clear () {
        this.$refs.form.reset()
      },
      vote (name) {
        axios.post('http://localhost:8088/courses/vote', {
          Name: name,
          Participant: [
            {
              Name: 'vote',
              Email: 'vote@gmail.com'
            }
          ]
        }, httpCfg)
          .then((res) => {
            eventBus.snackbarShown({type: 'success', msg: `Vote successfully`})
          })
          .catch((err) => {
            console.error('Error vote', err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to vote: ${err}`})
          })
      }
    }
  }
</script>