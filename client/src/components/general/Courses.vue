<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <div class="mt-5">
                        <span class="h1">Enrolled Courses</span>
                        <b-button variant="success" class="mb-3 float-right" :to="{ name: 'teacher-dashboard.courses.create' }">Create Course</b-button>
                    </div>
                </b-col>
            </b-row>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="course in courses" :key="course.id" class="d-flex align-items-stretch">
                    <b-card :title="course.name" :sub-title="course.name" class="mb-3">
                        <p class="card-text">
                            {{ course.description | truncate(200)}}
                        </p>
                        <div>
                            <b-button-group size="sm" class="d-inline-block">
                                <b-button v-if="course.role === 'student'" variant="outline-primary" :to="{ name: 'student-dashboard.course.home', params: { courseId: course.id } }">Enter as Student</b-button>
                                <b-button v-else-if="course.role === 'TA'" variant="outline-primary" :to="{ name: 'teaching-assistant-dashboard.course.home', params: { courseId: course.id } }">Enter as TA</b-button>
                                <b-button v-else-if="course.role === 'teacher'" variant="outline-primary" :to="{ name: 'teacher-dashboard.course', params: { id: course.id } }">Enter as Teacher</b-button>
                                <b-button variant="outline-danger" :to="{ name: 'student-dashboard.course.home', params: { courseId: course.id } }">Student (DEV)</b-button>
                                <b-button variant="outline-danger" :to="{ name: 'teaching-assistant-dashboard.course.home', params: { courseId: course.id } }">TA (DEV)</b-button>
                                <b-button variant="outline-danger" :to="{ name: 'teacher-dashboard.course', params: { id: course.id } }">Teacher (DEV)</b-button>
                            </b-button-group>
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

