<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems"/>

        <keep-alive exclude="Assignment"><router-view></router-view></keep-alive>

    </div>
</template>

<script>
import api from "../../api"
import Navbar from "../Navbar"

export default {
    async created() {
        let res = await api.getCourse(this.$route.params.courseId)
        this.course = res.data
    },
    data() {
        return {
            navbarItems: [
                { to: { name: 'student-dashboard.course.home' } , text: 'Course Home'},
                { to: { name: 'student-dashboard.course.assignments' } , text: 'Assignments'},
            ],
            course: {
                name: null
            }
        }
    },
    components: {
        Navbar
    }
}
</script>


