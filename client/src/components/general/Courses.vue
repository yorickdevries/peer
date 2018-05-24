<template>
    <div>

        <b-container>

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
                            {{ course.description}}
                        </p>
                        <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
                            <b-button variant="primary" :to="{ name: 'student-dashboard.course', params: { id: course.id } }">Enter as Student</b-button>
                            <b-button disabled variant="primary" :to="{ name: 'teaching-assistant-dashboard.course', params: { id: course.id } }">Enter as TA</b-button>
                            <b-button variant="primary" :to="{ name: 'teacher-dashboard.course', params: { id: course.id } }">Enter as Teacher</b-button>
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
    async created() {
        let res = await api.getCourses()
        this.courses = res.data
    },
    data() {
        return {
            courses: null,
        }
    }
}
</script>

