<template>
    <div>
        <Navbar/>

        <main>
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
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

