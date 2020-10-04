<template>
    <div>
        <b-card v-if="assignment" header="Edit Assignment Version">
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
            <!--assignmentVersionsToReview-->
            <b-form-group
                label="Assignment versions that students need to review when they made a submission for this assignment version"
            >
                <b-alert show>You can select multiple versions with CTRL</b-alert>
                <b-form-select
                    v-model="assignmentVersion.versionsToReview"
                    :options="assignmentVersionOptions"
                    multiple
                ></b-form-select>
            </b-form-group>
            <!--selfReview-->
            <b-form-group>
                <b-form-checkbox v-model="assignmentVersion.selfReview"
                    >Let students make a review of their own submission</b-form-checkbox
                >
            </b-form-group>
            <b-button variant="primary" class="mt-3" @click="editAssignmentVersion">Edit Assignment Version</b-button>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    data() {
        return {
            assignment: null,
            assignmentVersion: null
        }
    },
    async created() {
        const res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
        const res2 = await api.assignmentversions.get(this.assignmentVersionId)
        const assignmentVersion = res2.data
        // replace list of versions to review by id list
        const versionsToReview = []
        for (const versionToReview of assignmentVersion.versionsToReview) {
            versionsToReview.push(versionToReview.id)
        }
        assignmentVersion.versionsToReview = versionsToReview
        this.assignmentVersion = assignmentVersion
    },
    computed: {
        checkReviewsPerUser() {
            if (this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview === null) {
                return null
            } else {
                return this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview > 0
            }
        },
        assignmentVersionOptions() {
            const options = []
            if (this.assignment) {
                for (const assignmentVersion of this.assignment.versions) {
                    options.push({
                        value: assignmentVersion.id,
                        text: `${assignmentVersion.name} (ID: ${assignmentVersion.id})`
                    })
                }
            }
            return options
        }
    },
    methods: {
        async editAssignmentVersion() {
            await api.assignmentversions.patch(
                this.assignmentVersion.id,
                this.assignmentVersion.name,
                this.assignmentVersion.versionsToReview,
                this.assignmentVersion.reviewsPerUserPerAssignmentVersionToReview,
                this.assignmentVersion.selfReview
            )
            this.showSuccessMessage({ message: "Assignment version succesfully changed" })
            this.$emit("assignmentVersionChanged")
        }
    }
}
</script>
