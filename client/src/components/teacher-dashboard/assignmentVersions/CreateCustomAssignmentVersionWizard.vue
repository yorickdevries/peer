<template>
    <b-card header="Create Custom Assignment Version">
        <b-alert show
            >You can edit the distribution strategy after creation (like which versions to review and whether
            self-reviews is enabled)</b-alert
        >
        <!--Version name-->
        <b-form-group label="Assignment version name">
            <b-form-input
                v-model="assignmentVersion.name"
                type="text"
                placeholder="Please enter the name here"
                required
            >
            </b-form-input>
        </b-form-group>
        <!--Number of peer reviews-->
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
            >Create Custom Assignment Version</b-button
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
            await api.assignmentversions.post(
                this.assignmentVersion.name,
                this.$route.params.assignmentId,
                this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview
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
