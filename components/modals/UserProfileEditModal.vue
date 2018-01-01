<template>
  <v-dialog v-model="dialog" persistent max-width="700px">
    <v-flex class="sm12">
      <v-card>
        <v-card-title primary-title>
          <h3 class="headline mb-0">Edit Profile</h3>
        </v-card-title>
        <v-card-text>
          <h3 class="pb-3">Avatar</h3>
          <div v-if="!user || !user.avatar">
            Select an image<br>
            <input type="file" @change="onFileChange">
          </div>
          <div v-else>
            <v-avatar size="100" color="white">
              <img :src="user.avatar | toAvatarURL" style="border: 2px solid #F5F5F5"/>
            </v-avatar>
            <v-tooltip top>
              <v-btn fab small color="red" style="margin-left: -30px; margin-top: 70px" slot="activator" @click="removeAvatar">
                <v-icon small>delete</v-icon>
              </v-btn>
              <span>Remove avatar</span>
            </v-tooltip>
          </div>

          <h3 class="pt-4 pb-3">Info</h3>
          <v-form v-model="valid" v-if="user">
            <v-text-field label="Name" v-model="user.name" :rules="nameRules" required></v-text-field>
            <v-text-field label="Email" v-model="user.email" :rules="emailRules" required></v-text-field>
            <v-text-field label="Team" v-model="user.team" required></v-text-field>
            <v-text-field label="Location" v-model="user.location" required></v-text-field>
            <v-text-field label="Something about me" v-model="user.about"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="dialog = false" :disabled="loading">Cancel</v-btn>
          <v-btn color="info" @click="updateUser" :loading="loading">update</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-dialog>
</template>

<script>
  import {eventBus, httpCfg} from '~/util/util'
  import {mapMutations} from 'vuex'
  let exeAddr = process.env.EXECUTIONER_ADDRESS

  export default {
    name: 'user-profile-edit-modal',
    data () {
      return {
        dialog: false,
        user: null,
        valid: false,
        nameRules: [
          (v) => !!v || 'Name is required'
        ],
        emailRules: [
          (v) => !!v || 'E-mail is required',
          (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
        ],
        loading: false,
        avatar: {
          format: '',
          raw: null
        },
        isUserUpdated: false
      }
    },
    methods: {
      ...mapMutations(['setAvatar']),
      updateUser () {
        this.loading = true
        this.$axios.patch(`${exeAddr}/api/v1/users/${this.$route.params.id}`, this.user, httpCfg)
          .then((result) => {
            this.isUserUpdated = true
            eventBus.snackbarShown({type: 'success', msg: `Your profile was updated`})
            this.loading = false
            this.dialog = false
          })
          .catch((err) => {
            this.loading = false
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to update profile: ${err}`})
          })
      },
      onFileChange (e) {
        let files = e.target.files || e.dataTransfer.files
        if (files.length !== 1) {
          return
        }
        let f = files[0]
        if (f.type !== 'image/png' && f.type !== 'image/jpeg' && f.type !== 'image/gif') {
          eventBus.snackbarShown({type: 'error', msg: 'Invalid file type'})
          return
        }
        if (f.size > 2000000) { // 2MB
          eventBus.snackbarShown({type: 'error', msg: 'File size must less than 2MB'})
          return
        }
        this.avatar.format = f.type
        let reader = new FileReader()
        let vm = this
        reader.onload = (e) => {
          console.log('read')
          vm.avatar.raw = e.target.result
          vm.uploadUserAvatar()
        }
        reader.readAsDataURL(files[0])
      },
      uploadUserAvatar () {
        this.loading = true
        console.log('start upload')
        this.$axios.post(`${exeAddr}/api/v1/users/${this.$route.params.id}/avatar`, this.avatar, httpCfg)
          .then((result) => {
            // Add seed timestamp to force image reload
            let ts = +new Date()
            this.user.avatar = `/api/v1/users/${this.$route.params.id}/avatar?s=${ts}`
            this.setAvatar(this.user.avatar)
            this.$axios.patch(`${exeAddr}/api/v1/users/${this.$route.params.id}`, this.user, httpCfg)
              .then(res => {
                this.isUserUpdated = true
                eventBus.snackbarShown({type: 'success', msg: `Your avatar was updated`})
                this.loading = false
              })
              .catch(err => {
                throw err
              })
          })
          .catch((err) => {
            this.loading = false
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to update avatar: ${err}`})
          })
      },
      removeAvatar () {
        this.loading = true
        this.$axios.delete(`${exeAddr}/api/v1/users/${this.$route.params.id}/avatar`, this.avatar, httpCfg)
          .then(result => {
            this.user.avatar = ``
            this.$axios.patch(`${exeAddr}/api/v1/users/${this.$route.params.id}`, this.user, httpCfg)
              .then(res => {
                this.isUserUpdated = true
                this.setAvatar('')
                eventBus.snackbarShown({type: 'success', msg: `Your avatar was removed`})
                this.loading = false
              })
              .catch(err => {
                throw err
              })
          })
          .catch(err => {
            this.loading = false
            console.log(err)
            eventBus.snackbarShown({type: 'error', msg: `Failed to remove avatar: ${err}`})
          })
      }
    },
    filters: {
      toAvatarURL (val) {
        return `${exeAddr}${val}`
      }
    },
    created () {
      eventBus.$on('showUserProfileEditModal', (user) => {
        this.dialog = true
        this.user = user
      })
    },
    beforeDestroy () {
      if (this.isUserUpdated) {
        eventBus.userProfileUpdated(this.user) // TODO: May force reload rather than notify
      }
    }
  }
</script>
