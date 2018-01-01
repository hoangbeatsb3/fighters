<template>
  <v-container>
    User is not defined
  </v-container>
</template>

<script>
  export default {
    data () {
      return {}
    },
    filters: {
      toTextLevel (val) {
        switch (val) {
          case 1:
            return 'Veteran'
          case 2:
            return 'Swordsman'
          case 3:
            return 'Warrior'
          case 4:
            return 'Champion'
          case 5:
            return 'Hero'
          case 6:
            return 'Legend'
          case 7:
            return 'God of War'
          default:
            return ''
        }
      },
      toTeam (val) {
        if (!val) {
          return ''
        }
        let cns = val.split(',')
        return cns[0].trim().substring(cns[0].indexOf('=') + 1)
      }
    }
  }
</script>
