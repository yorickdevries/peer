<template>
    <div>
        <Navbar :title="'TI1316: Algoritmen en Datastructuren'" :links="navbarItems"/>

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
                { to: { name: 'student-dashboard.course' } , text: 'Course Home'},
            ]
        }
    }
}
</script>


