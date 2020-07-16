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
import api from "../../api_old"
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [{ to: { name: "student-dashboard.course.assignments" }, text: "Assignments" }],
            course: {
                name: null
            }
        }
    },
    async created() {
        // Fetch course information (for navbar).
        let res = await api.getCourse(this.$route.params.courseId)
        this.course = res.data
    }
}
</script>
