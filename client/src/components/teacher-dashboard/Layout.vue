<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" role="teacher" variant="success" />
        <transition name="slide-right" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
import api from "../../api/api"
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [
                { to: { name: "teacher-dashboard.course" }, text: "Course Home" },
                { to: { name: "teacher-dashboard.assignments" }, text: "Assignments" },
                { to: { name: "teacher-dashboard.course.teachers" }, text: "Teacher Management" },
                { to: { name: "teacher-dashboard.course.teaching-assistants" }, text: "TA Management" },
                { to: { name: "teacher-dashboard.course.students" }, text: "Student Management" },
                { to: { name: "teacher-dashboard.course.statistics" }, text: "Statistics" }
            ],
            course: {}
        }
    },
    async created() {
        // Fetch course information (for navbar).
        let res = await api.courses.get(this.$route.params.courseId)
        this.course = res.data
    }
}
</script>
