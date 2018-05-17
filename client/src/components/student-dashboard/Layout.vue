<template>
    <div>
        <Navbar :links="navbarItems"/>

        <keep-alive><router-view></router-view></keep-alive>

    </div>
</template>

<script>
import Navbar from "../Navbar"

export default {
    name: "StudentDashboard",
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [
                { to: { name: 'student-dashboard.index' } , text: 'Dashboard'},
                { to: { name: 'student-dashboard.courses' } , text: 'Courses'}
            ]
        }
    }
}
</script>


