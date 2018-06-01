<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Available Courses</h1>
                    <b-button variant="success" class="mb-3" :to="{ name: 'teacher-dashboard.courses.create' }">Create Course</b-button>
                </b-col>
            </b-row>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="course in courses" :key="course.id">
                    <b-card :title="course.name" :sub-title="course.name" class="mb-3">
                        <p class="card-text">
                            {{ course.description | truncate(200)}}
                        </p>
                        <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
                            <b-button v-if="course.role === 'student'" variant="outline-primary" :to="{ name: 'student-dashboard.course.home', params: { courseId: course.id } }">Enter as Student</b-button>
                            <b-button v-else-if="course.role === 'TA'" variant="outline-primary" :to="{ name: 'teaching-assistant-dashboard.course.home', params: { courseId: course.id } }">Enter as TA</b-button>
                            <b-button v-else-if="course.role === 'teacher'" variant="outline-primary" :to="{ name: 'teacher-dashboard.course', params: { id: course.id } }">Enter as Teacher</b-button>
                        </div>
                    </b-card>
                </b-col>

            </b-row>
        </b-container>

    </div>
</template>

<script>
import api from '../../api'

export default {
    data() {
        return {
            courses: [],
            courseRoles: [
                {
                    id: null,
                    role: ''
                }
            ]
        }
    },
    async created() {
        // Fetch courses that user can access.
        await this.fetchCourses()
        await this.fetchAllCourseRoles()
    },
    methods: {
        async fetchCourses() {
            let res = await api.getEnrolledCourses()
            this.courses = res.data
        },
        async fetchAllCourseRoles() {
            for (let i = 0; i < this.courses.length; i++) {
                let res = await api.getCurrentRoleForCourse(this.courses[i].id)
                this.$set(this.courses[i], 'role', res.data.role)
            }
        }
    }
}
</script>

