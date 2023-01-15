import Vue from "vue"
import App from "./App.vue"
import router from "./router"

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

new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app")
