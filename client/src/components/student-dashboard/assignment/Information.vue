<template>
    <b-card header="Assignment Details" class="h-100">
        <span class="font-weight-bold">Description</span>
        <p>{{ assignment.description }}</p>

        <span class="font-weight-bold">Submission Due Date</span>
        <p>At this date the submission for the assignment needs to be submitted in the submission tab.<br/>{{ assignment.due_date | formatDate}}</p>

        <span class="font-weight-bold">Review Due Date</span>
        <p>At this date the submission for the assignment needs to be submitted in the submission tab.<br/>{{ assignment.review_due_date | formatDate }}</p>

        <b-button variant="primary w-100" :href="assignmentFilePath" >Download Assignment</b-button>
    </b-card>
</template>

<script>
import api from "../../../api"

export default {
    data() {
        return {
            assignment: {
                title: null,
                description: null,
                due_date: null,
                publish_date: null,
                review_due_date: null,
                id: null,
                course_id: null,
                filename: ""
            }
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        }
    },
    async created() {
        await this.fetchAssignment()
    },
    methods: {
        async fetchAssignment() {
            // Fetch the assignment.
            let res = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = res.data
        }
    }
}
</script>
