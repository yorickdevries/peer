export default {
    data() {
        return {
            screenWidth: 0,
            screenHeight: 0,
            isMobile: false,
        }
    },
    created: function () {
        this.$nextTick(() => {
            this.checkResize()
        })
        window.addEventListener("resize", this.checkResize)
    },
    beforeDestroy: function () {
        window.removeEventListener("resize", this.checkResize)
    },
    methods: {
        checkResize: function () {
            // https://stackoverflow.com/a/11744120
            // https://bootstrap-vue.org/docs/components/layout#grid-options
            const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
            const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

            this.screenWidth = width
            this.screenHeight = height

            this.isMobile = this.screenWidth < 768
        },
    },
}
