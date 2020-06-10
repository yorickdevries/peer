<template>
    <div class="site">
        <router-view class="site-content d-flex flex-column"></router-view>
        <Footer></Footer>
    </div>
</template>

<script>
import Footer from "./components/Footer"
export default {
    components: { Footer }
}
</script>

<style lang="scss">
.site {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
}

.site-content {
    flex: 1;
}
</style>
