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
            day.setHours(time.split(":")[0])
            day.setMinutes(time.split(":")[1])
            day.setSeconds(0)
            day.setMilliseconds(0)
            return day
        },
    },
}
