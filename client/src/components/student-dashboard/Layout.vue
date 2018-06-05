<template>
    <div>
        <Navbar :title="course.name" :links="navbarItems" :role="role"/>

        <keep-alive exclude="Assignment">
            <router-view></router-view>
        </keep-alive>
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
                    {to: {name: 'student-dashboard.course.home'}, text: 'Course Home'},
                    {to: {name: 'student-dashboard.course.assignments'}, text: 'Assignments'},
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


