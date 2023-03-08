import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import * as Sentry from "@sentry/vue"
import { BrowserTracing } from "@sentry/tracing"

// Use BootstrapVue
import BootstrapVue from "bootstrap-vue"
Vue.use(BootstrapVue)

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core"

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

/* import specific icons */
import {
    faPen,
    faTrash,
    faChevronDown,
    faLock,
    faTableCellsLarge,
    faFolder,
    faCode,
    faComments,
} from "@fortawesome/free-solid-svg-icons"

/* add icons to the library */
library.add(faPen, faTrash, faChevronDown, faLock, faTableCellsLarge, faFolder, faCode, faComments)

/* add font awesome icon component */
Vue.component("icon", FontAwesomeIcon)

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
        position: "bottomCenter",
    })
}

// Use (custom) text filters.
import filters from "./filters"
Vue.use(filters)

const options = {
    success: toast,
    error: toast,
    info: toast,
    warn: toast,
}

Vue.use(VueNotifications, options)

//Import ApexCharts
import VueApexCharts from "vue-apexcharts"
Vue.use(VueApexCharts)
Vue.component("apexchart", VueApexCharts)

Vue.config.productionTip = false

if (process.env.NODE_ENV !== "development") {
    Sentry.init({
        Vue,
        dsn: process.env.VUE_APP_SENTRY_DSN,
        release: process.env.VUE_APP_SENTRY_RELEASE,
        environment: process.env.NODE_ENV,
        trackComponents: true,
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracePropagationTargets: ["localhost", "peer.tudelft.nl", "peer.eiptest.ewi.tudelft.nl", /^\//],
            }),
        ],
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: parseFloat(process.env.VUE_APP_SENTRY_TRACES_SAMPLE_RATE),
    })
}
new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app")
