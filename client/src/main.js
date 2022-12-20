import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import * as Sentry from "@sentry/vue"
import { BrowserTracing } from "@sentry/tracing"

// Use BootstrapVue
import BootstrapVue from "bootstrap-vue"
Vue.use(BootstrapVue)

// Use Vue-Awesome
import "vue-awesome/icons"
import Icon from "vue-awesome/components/Icon"
Vue.component("icon", Icon)

// Use custom CSS
import "./assets/css/_index.scss"

// Use notifications.
import VueNotifications from "vue-notifications"
import izitoast from "izitoast"
import "izitoast/dist/css/iziToast.min.css"

function toast({ title, message, type, timeout }) {
    return izitoast[type]({
        title,
        message,
        timeout,
        position: "bottomCenter"
    })
}

// Use (custom) text filters.
import filters from "./filters"
Vue.use(filters)

const options = {
    success: toast,
    error: toast,
    info: toast,
    warn: toast
}

Vue.use(VueNotifications, options)

//Import ApexCharts
import VueApexCharts from "vue-apexcharts"
Vue.use(VueApexCharts)
Vue.component("apexchart", VueApexCharts)

Vue.config.productionTip = false

Sentry.init({
    Vue,
    dsn: process.env.VUE_APP_SENTRY_DSN,
    release: process.env.VUE_APP_SENTRY_RELEASE,
    environment: process.env.NODE_ENV,
    trackComponents: true,
    integrations: [
        new BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracePropagationTargets: ["localhost", "peer.tudelft.nl", "peer.eiptest.ewi.tudelft.nl", /^\//]
        })
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.VUE_APP_SENTRY_TRACES_SAMPLE_RATE
})

new Vue({
    router,
    render: h => h(App)
}).$mount("#app")
