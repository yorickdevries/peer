<template>
    <footer class="text-muted">
        <div class="container d-flex align-items-center h-100">
            <div class="float-left ">
                <router-link @click.native="scrollToTop" to="/privacy">Privacy Policy</router-link>
                <div>For support, contact: <a href="mailto:eip-ewi@tudelft.nl">eip-ewi@tudelft.nl</a></div>
            </div>
            <div class="mr-auto"></div>
            <b-img :src="require('../assets/images/tu_delft_logo_black.png')" alt="tu-delft-logo" height="30px" class="mr-5 mb-3"></b-img>
            <div class="float-right ">
                <a href="#">Back to top</a>
            </div>
        </div>

    </footer>

</template>

<script>
    export default {
        name: "Footer",
        methods: {
            scrollToTop() {
                window.scrollTo(0,0);
            }
        }    }
</script>

<style scoped>
    footer {
        height: 125px;
    }

    footer p {
        margin-bottom: .25rem;
    }
</style>