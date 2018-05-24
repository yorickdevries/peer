<template>
    <div>

        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Assignments</h1>
                    <b-button variant="success" class="mb-3" :to="{ name: 'teacher-dashboard.assignments.create' }">Create Assignment</b-button>
                </b-col>
            </b-row>

            <!--Course Cards-->
            <b-row>
                <b-col cols="6" v-for="assignment in assignments" :key="assignment.id">
                    <b-card :title="assignment.title" :sub-title="assignment.title" class="mb-3">
                        <p class="card-text">
                            {{ assignment.description}}
                        </p>
                        <!--<div>-->
                            <!--<b-button variant="primary" :to="{ name: 'teacher-dashboard.assignments.assignment', params: { id: id, id2: assignment.id } }">View assignment</b-button>-->
                        <!--</div>-->
                        <!--<div class="btn-group btn-group-sm" role="group" aria-label="Basic example">-->
                            <!--<b-button variant="primary" :to="{ name: 'student-dashboard.course', params: { id: course.id } }">Enter as Student</b-button>-->
                            <!--<b-button variant="primary" :to="{ name: 'teaching-assistant-dashboard.course', params: { id: course.id } }">Enter as TA</b-button>-->
                            <!--<b-button variant="primary" :to="{ name: 'teacher-dashboard.course', params: { id: course.id } }">Enter as Teacher</b-button>-->
                        <!--</div>-->
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
        let id = this.$route.params.id
        this.id = id
        let res = await api.getCourseAssignments(id)
        this.assignments = res.data
    },
    data() {
        return {
            id: null,
            assignments: null,
        }
    }
}
</script>

