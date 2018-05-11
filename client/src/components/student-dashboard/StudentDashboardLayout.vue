<template>
    <div>
        <Navbar/>

        <main>
            <router-view></router-view>
        </main>

        <!--<Footer></Footer>-->
    </div>
</template>

<script>
import Footer from '../Footer'
import Navbar from "../Navbar"

export default {
name: "StudentDashboard",
    components: {
        Navbar,
        Footer
    }
}
</script>

<style scoped>

</style>

