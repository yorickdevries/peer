<template>
    <div>
        <b-container>

            <!--Header-->
            <b-row>
                <b-col>
                    <div class="mt-5">
                        <span class="h2">Enrolled Courses</span>
                        <b-button variant="success" class="mb-3 float-right" :to="{ name: 'teacher-dashboard.courses.create' }">Create Course</b-button>
                    </div>
                </b-col>
            </b-row>

            <!--Filter Input-->
            <b-row>
                <b-col class="mb-3" cols="6">
                    <b-input placeholder="Filter courses" v-model="filter"></b-input>
                </b-col>
            </b-row>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="course in filteredCourses" :key="course.id" class="d-flex align-items-stretch pr-0">

                    <!--Single Card-->
                    <b-card no-body class="mb-3 w-100">
                        <b-card-body class="d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h4 class="card-title m-0">{{ course.name }}</h4>
                                <b-badge v-if="course.role" show variant="primary font-weight-bold">{{ course.role.toUpperCase() }}</b-badge>
                            </div>
                            <div class="mb-auto">
                                <p>{{ course.description | truncate(200)}}</p>
                            </div>
                            <div>
                                <b-button   v-if="course.role === 'student'" variant="outline-primary" size="sm"
                                            :to="{ name: 'student-dashboard.course.home', params: { courseId: course.id } }">
                                            Enter
                                </b-button>
                                <b-button   v-else-if="course.role === 'TA'" variant="outline-primary" size="sm"
                                            :to="{ name: 'teaching-assistant-dashboard.course.home', params: { courseId: course.id } }">
                                            Enter
                                </b-button>
                                <b-button   v-else-if="course.role === 'teacher'" variant="outline-primary" size="sm"
                                            :to="{ name: 'teacher-dashboard.course', params: { courseId: course.id } }">
                                            Enter
                                </b-button>
                            </div>
                        </b-card-body>
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
            ],
            filter: ""
        }
    },
    computed: {
        filteredCourses() {
            // Filters course based on text filter.
            if (this.filter === "") return this.courses

            return this.courses.filter(course => {
                return course.name.toLowerCase().includes(this.filter.toLowerCase())
            })
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

