<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Your Courses</h1>
                    <b-breadcrumb :items="items"/>
                </b-col>
            </b-row>

            <b-row>
                <b-col>

                    <b-card v-for="course in courses" :title="course.name" :sub-title="course.name" class="mb-3">
                        <p class="card-text">
                            {{ course.description}}
                        </p>
                        <b-button variant="success" :to="{ name: 'student-dashboard.course', params: { id: course.id } }">Enter</b-button>
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
            items: [
            {
                text: 'Courses',
                to: { name: 'student-dashboard'}
            }],
            courses: []
        }
    }
}
</script>
