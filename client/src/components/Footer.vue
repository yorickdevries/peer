<template>
    <footer class="text-muted">
        <div class="container">
            <b-row align-v="center" align-h="center">
                <b-col sm="4" align-self="center" class="d-flex justify-content-center footerElem">
                    <b-img
                        id="logoImg"
                        :src="require('../assets/images/tu_delft_logo_black.png')"
                        alt="tu-delft-logo"
                        height="30px"
                        style="position: relative"
                    ></b-img>
                </b-col>
                <b-col sm="4" align-self="center" class="flexCenterElem footerElem">
                    <div class="flexCenterElem">
                        For technical support, contact: <a href="mailto:eip-ewi@tudelft.nl">eip-ewi@tudelft.nl</a>
                    </div>
                </b-col>
                <b-col sm="4" align-self="center" class="flexCenterElem footerElem">
                    <router-link @click.native="scrollToTop" to="/privacy">Privacy Policy</router-link>
                </b-col>
            </b-row>
        </div>
    </footer>
</template>

<script>
export default {
    name: "Footer",
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
    .footerElem {
        margin-bottom: 5px;
    }
}
@media not (max-width: 576px) {
    #logoImg {
        right: -13px;
    }
}
footer {
    margin-top: 25px;
    height: 75px;
}

footer p {
    margin-bottom: 0.25rem;
}
</style>
