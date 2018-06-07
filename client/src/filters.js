export default {
    install(Vue) {
        Vue.filter('truncate', (text, stop, clamp) => {
            return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
        });
        Vue.filter('formatDate', (date) => {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`
        })
    }
}