import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Use BootstrapVue
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)

// Use Vue-Awesome
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('icon', Icon)

// Use custom CSS
import './assets/css/_index.scss?module'

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

