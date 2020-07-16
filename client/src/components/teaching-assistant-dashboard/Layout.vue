<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" role="ta" variant="danger" />

        <transition name="slide-right" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
import api from "../../api/api_old"
import Navbar from "../Navbar"

export default {
    components: {
        Navbar
    },
    data() {
        return {
            navbarItems: [{ to: { name: "teaching-assistant-dashboard.course" }, text: "Assignments" }],
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
    }
}
</script>
