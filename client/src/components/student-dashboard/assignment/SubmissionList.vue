<template>
    <div>
        <b-card v-if="!assignment || assignment.versions.length === 0">No assignment versions available.</b-card>
        <div v-else>
            <b-card no-body>
                <b-alert v-if="assignment.versions.length > 1" show
                    >Select the right assignment version for your submission</b-alert
                >
                <hr />
                <b-tabs card lazy>
                    <b-tab>
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                Select
                            </div>
                        </template>
                        <b-alert show>Please select your assignment version above</b-alert>
                    </b-tab>
                    <b-tab v-for="assignmentVersion in assignment.versions" :key="assignmentVersion.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2"
                                    >{{ assignmentVersion.name }} (ID: {{ assignmentVersion.id }})</b-badge
                                >
                            </div>
                        </template>
                        <Submission :assignmentVersionId="assignmentVersion.id"></Submission>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import Submission from "./Submission"
import api from "../../../api/api"

export default {
    components: {
        Submission
    },
    data() {
        return {
            assignment: null
        }
    },
    async created() {
        const res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
    }
}
</script>
