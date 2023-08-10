import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Amplify } from 'aws-amplify'
import awsExports from './aws-exports'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives
})

Amplify.configure(awsExports)

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.mount('#app')
