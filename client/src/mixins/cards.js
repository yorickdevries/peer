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
    },
}
