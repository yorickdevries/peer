<template>
    <b-card header="Create Default Assignment Version">
        <!--Number of peer reviews per student-->
        <b-form-group label="Number of reviews per reviewed assignment version that each student needs to do">
            <b-form-input
                v-model="assignmentVersion.reviewsPerUserPerAssignmentVersionToReview"
                type="number"
                :state="checkReviewsPerUser"
                placeholder="Enter an integer larger than 0"
                required
            >
            </b-form-input>
        </b-form-group>
        <b-button variant="primary" class="mt-3" @click="createAssignmentVersion"
            >Create Default Assignment Version</b-button
        >
    </b-card>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            assignmentVersion: {}
        }
    },
    methods: {
        async createAssignmentVersion() {
            const res = await api.assignmentversions.post(
                "default",
                this.$route.params.assignmentId,
                this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview
            )
            const assignmentVersion = res.data
            // patch the created assignmentVersion
            await api.assignmentversions.patch(
                assignmentVersion.id,
                assignmentVersion.name,
                [assignmentVersion.id],
                assignmentVersion.reviewsPerUserPerAssignmentVersionToReview,
                assignmentVersion.selfReview
            )
            this.showSuccessMessage({ message: "Default assignment version succesfully created" })
            this.$emit("assignmentVersionChanged")
        }
    },
    computed: {
        checkReviewsPerUser() {
            if (this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview === null) {
                return null
            } else {
                return this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview > 0
            }
        }
    }
}
</script>
