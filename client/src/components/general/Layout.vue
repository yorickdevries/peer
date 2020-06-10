<template>
    <div>
        <Navbar :links="null"></Navbar>

        <transition name="slide-right" mode="out-in">
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </transition>
    </div>
</template>

<script>
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    }
}
</script>
