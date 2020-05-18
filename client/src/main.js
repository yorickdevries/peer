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

// Use notifications.
import VueNotifications from 'vue-notifications'
import izitoast  from 'izitoast'
import 'izitoast/dist/css/iziToast.min.css'

function toast ({title, message, type, timeout, cb}) {
    return izitoast[type]({
        title,
        message,
        timeout,
        onOpened: cb,
        position: 'bottomCenter'
    })
}

// Use (custom) text filters.
import filters from './filters'
Vue.use(filters)

const options = {
    success: toast,
    error: toast,
    info: toast,
    warn: toast
}

Vue.use(VueNotifications, options)

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

