<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems"/>

        <keep-alive><router-view></router-view></keep-alive>

    </div>
</template>

<script>
import api from "../../api"
import Navbar from "../Navbar"

export default {
    async created() {
        let res = await api.getCourse(this.$route.params.id)
        this.course = res.data[0]
    },
    data() {
        return {
            navbarItems: [
                { to: { name: 'student-dashboard.course' } , text: 'Course Home'},
                { to: { name: 'student-dashboard.assignments' } , text: 'Assignments'},
            ],
            course: null
        }
    },
    components: {
        Navbar
    }
}
</script>


