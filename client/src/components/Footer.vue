<template>
    <footer class="text-muted">
        <div class="container">
            <b-row align-v="center" align-h="center">
                <b-col sm="4" align-self="center" class="flexCenterElem">
                    <router-link @click.native="scrollToTop" to="/privacy">Privacy Policy</router-link>
                    <div class="flexCenterElem">
                        <a href="https://eip.pages.ewi.tudelft.nl/peer/">Wiki</a>
                    </div>
                    <div class="flexCenterElem">
                        For technical support, contact: <a href="mailto:eip-ewi@tudelft.nl">eip-ewi@tudelft.nl</a>
                    </div>
                </b-col>
                <b-col sm="4" align-self="center" class="flexCenterElem">{{ timezoneString }}</b-col>
                <b-col sm="2" align-self="center" class="flexCenterElem">
                    <b-img
                        id="logoImg"
                        :src="require('../assets/images/tu_delft_logo_black.png')"
                        alt="tu-delft-logo"
                        height="30px"
                        style="position: relative"
                    ></b-img>
                </b-col>
                <b-col sm="2" align-self="center" class="flexCenterElem">
                    <a href="#">Back to top</a>
                </b-col>
            </b-row>
        </div>
    </footer>
</template>

<script>
export default {
    name: "Footer",
    computed: {
        timezoneString() {
            const re = /([A-Z]+[+-][0-9]+.*)/
            const timezone = new Date().toString().match(re)[1]
            return "Timezone: " + timezone
        },
    },
    methods: {
        scrollToTop() {
            window.scrollTo(0, 0)
        },
    },
}
</script>

<style scoped>
@media (max-width: 576px) {
    .flexCenterElem {
        text-align: center;
    }
    #logoImg {
        right: 0;
    }
}
@media not (max-width: 576px) {
    #logoImg {
        right: 17px;
    }
}
footer {
    margin-top: 20px;
    height: 125px;
}

footer p {
    margin-bottom: 0.25rem;
}
</style>
