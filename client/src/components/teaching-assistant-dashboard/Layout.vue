<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" :role="role" variant="danger"/>

        <transition name="slide-right" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import api from "../../api"
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [
                { to: { name: 'teaching-assistant-dashboard.course' } , text: 'Assignments'}
            ],
            course: {
                name: null
            },
            role: ""
        }
    },
    async created() {
        // Fetch course information (for navbar).
        let res = await api.getCourse(this.$route.params.courseId)
        this.course = res.data

        // Fetch user information about course.
        let {data} = await api.getCurrentRoleForCourse(this.$route.params.courseId)
        this.role = data.role
    },
}
</script>


