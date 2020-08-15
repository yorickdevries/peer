import moment from "moment"

export default {
    install(Vue) {
        Vue.filter("truncate", (text, stop, clamp) => {
            return text.slice(0, stop) + (stop < text.length ? clamp || "..." : "")
        })
        Vue.filter("formatDate", date => {
            // Formats the date to a readable format for the UI.
            return moment(new Date(date)).format("dddd, MMMM Do YYYY, HH:mm:ss")
        }),
            Vue.filter("formatDateCompact", date => {
                return moment(new Date(date)).format("DD-MM-YYYY, HH:mm:ss")
            })
    }
}
