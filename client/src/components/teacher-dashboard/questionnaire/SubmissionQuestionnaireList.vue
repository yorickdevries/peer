<template>
    <div>
        <b-card v-if="!assignment || assignment.versions.length === 0">No assignment versions available.</b-card>
        <div v-else>
            <b-card no-body>
                <b-tabs card>
                    <b-tab v-for="assignmentVersion in assignment.versions" :key="assignmentVersion.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2"
                                    >{{ assignmentVersion.name }} (ID: {{ assignmentVersion.id }})</b-badge
                                >
                            </div>
                        </template>
                        <SubmissionQuestionnaireWizard
                            :assignmentVersionId="assignmentVersion.id"
                        ></SubmissionQuestionnaireWizard>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import SubmissionQuestionnaireWizard from "./SubmissionQuestionnaireWizard"
import api from "../../../api/api"

export default {
    components: {
        SubmissionQuestionnaireWizard
    },
    data() {
        return {
            assignment: null
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchReviews()
    },
    methods: {
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        }
    }
}
</script>
