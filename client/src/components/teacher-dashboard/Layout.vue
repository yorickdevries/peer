<template>
    <div>
        <Navbar :links="navbarItems"/>

        <keep-alive><router-view></router-view></keep-alive>

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
                { to: { name: 'teacher-dashboard.course' } , text: 'Course Home' },
                { to: { name: 'teacher-dashboard.course' } , text: 'Assignments' },
                { to: { name: 'teacher-dashboard.course' } , text: 'TA Management' },
                { to: { name: 'teacher-dashboard.course' } , text: 'Student Management' },
                { to: { name: 'teacher-dashboard.course' } , text: 'Students' },
            ]
        }
    }
}
</script>


