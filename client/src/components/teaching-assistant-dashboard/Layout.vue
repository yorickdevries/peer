<template>
    <div>
        <Navbar :links="navbarItems"/>

        <router-view></router-view>

    </div>
</template>

<script>
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'Assignments'},
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'TA Jobs' },
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'Students' },
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'Grades' },
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'Help'},

            ]
        }
    }
}
</script>


