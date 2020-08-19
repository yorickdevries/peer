<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" role="student" />
        <transition name="slide-right" mode="out-in">
            <keep-alive exclude="Assignment">
                <router-view></router-view>
            </keep-alive>
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
            navbarItems: [{ to: { name: "student-dashboard.course.assignments" }, text: "Assignments" }],
            course: {}
        }
    },
    async created() {
        // Fetch course information (for navbar).
        const res = await api.courses.get(this.$route.params.courseId)
        this.course = res.data
    }
}
</script>
