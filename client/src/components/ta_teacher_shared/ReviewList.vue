<template>
    <div>
        <b-card v-if="!assignment || assignment.versions.length === 0">No assignment versions available.</b-card>
        <div v-else>
            <b-card no-body>
                <b-tabs card lazy>
                    <b-tab v-for="assignmentVersion in assignment.versions" :key="assignmentVersion.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2"
                                    >{{ assignmentVersion.name }} (ID: {{ assignmentVersion.id }})</b-badge
                                >
                            </div>
                        </template>
                        <Reviews :assignmentVersionId="assignmentVersion.id"></Reviews>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import Reviews from "./Reviews"
import api from "../../api/api"

export default {
    components: {
        Reviews
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
