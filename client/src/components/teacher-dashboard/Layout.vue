<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" :role="role" variant="success"/>

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
                { to: { name: 'teacher-dashboard.course' } , text: 'Course Home' },
                { to: { name: 'teacher-dashboard.assignments' } , text: 'Assignments' },
                { to: { name: 'teacher-dashboard.course.teaching-assistants' }, text: 'TA Management' },
                { to: { name: 'teacher-dashboard.course.students' }, text: 'Student Management' },
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


