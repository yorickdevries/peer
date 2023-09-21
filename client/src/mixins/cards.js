export default {
    methods: {
        nextCard() {
            this.$emit("next-card")
        },
        prevCard() {
            this.$emit("prev-card")
        },
        switchMode() {
            this.$emit("switch-mode")
        },
        constructDate(day, time) {
            const date = new Date()
            console.log(day.getFullYear(), day.getMonth(), day.getDate())
            date.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
            date.setHours(time.split(":")[0])
            date.setMinutes(time.split(":")[1])
            date.setSeconds(0)
            date.setMilliseconds(0)
            return date
        },
    },
}
