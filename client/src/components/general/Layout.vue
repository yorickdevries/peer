<template>
    <div>
        <Navbar :links="null"></Navbar>

        <keep-alive>
            <router-view></router-view>
        </keep-alive>

    </div>
</template>

<script>
import Navbar from '../Navbar'

export default {
    components: {
        Navbar
    }
}
</script>
