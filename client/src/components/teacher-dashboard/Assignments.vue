<template>
    <div>

        <b-container>

            <!--Header with create button-->
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
            id: null,
            assignments: [],
        }
    },
    async created() {

        this.init()
    },
    methods: {
        async init() {
            let id = this.$route.params.id
            this.id = id
            let res = await api.getCourseAssignments(id)
            this.assignments = res.data
        }
    }
}
</script>