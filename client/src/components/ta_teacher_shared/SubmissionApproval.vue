<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle
                :items="['Assignments', assignment.name, 'Submissions', submission.id]"
                class="mt-3"
            ></BreadcrumbTitle>

            <!--Next Submission-->
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between align-items-center">
                    <div>Submission information</div>
                    <div>
                        <b-button size="sm" variant="secondary" @click="goToAssignment" class="mr-2"
                            >Back to Assignment</b-button
                        >
                        <b-button size="sm" variant="primary" @click="goToNextFinalSubmissionWithoutApproval"
                            >Next (Random) Final Submission Without Approval</b-button
                        >
                    </div>
                </b-card-header>
                <b-card-body>
                    <b-row>
                        <!--Download-->
                        <b-col cols="6">
                            <div>
                                <dl>
                                    <dt>Download</dt>
                                    <dd>The download for the submission.</dd>
                                    <a target="_blank" :href="submissionFilePath">
                                        <button
                                            type="button"
                                            class="btn btn-success success w-100"
                                            style="height: 3rem"
                                        >
                                            Download Submission ({{ submissionFileName }})
                                        </button>
                                    </a>
                                </dl>
                            </div>
                        </b-col>

                        <!--Approval-->
                        <b-col cols="6">
                            <dl>
                                <dt>Current submission status</dt>
                                <dd>{{ submission.final ? "" : "Not " }}Final</dd>
                            </dl>
                            <dt>Current approval status</dt>
                            <dd v-if="submission.approvalByTA">Approved 👍</dd>
                            <dd v-if="submission.approvalByTA === false">Disapproved 👎</dd>
                            <dd v-if="submission.approvalByTA === null">No action yet by any TA.</dd>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <PDFAnnotator
                                v-if="viewPDF && submission.file.extension === '.pdf'"
                                :submissionId="submission.id"
                                :readOnly="true"
                            ></PDFAnnotator>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-card>
            <b-card class="mt-3">
                <!--Approval-->
                <div>
                    <dl>
                        <dt>Current approval status</dt>
                        <dd v-if="submission.approvalByTA">Approved 👍</dd>
                        <dd v-if="submission.approvalByTA === false">Disapproved 👎</dd>
                        <dd v-if="submission.approvalByTA === null">No action yet by any TA.</dd>
                        <dd>
                            <b-button
                                variant="danger"
                                class="mr-2"
                                @click="updateSubmissionApproval(false)"
                                :disabled="submission.approvalByTA === false && !commentChanged"
                                >Disapprove 👎</b-button
                            >
                            <b-button
                                variant="success"
                                @click="updateSubmissionApproval(true)"
                                :disabled="submission.approvalByTA === true && !commentChanged"
                                >Approve 👍</b-button
                            >
                        </dd>
                    </dl>
                    <dl>
                        <b-form-textarea
                            placeholder="Add an optional comment"
                            v-model="submission.commentByTA"
                            @input="commentChanged = true"
                        />
                    </dl>
                </div>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import _ from "lodash"
import notifications from "../../mixins/notifications"
import BreadcrumbTitle from "../BreadcrumbTitle"
import PDFAnnotator from "../student-dashboard/assignment/PDFAnnotator"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle, PDFAnnotator },
    data() {
        return {
            assignment: {},
            submission: {},
            commentChanged: false,
            // dont view pdf until data is fetched
            viewPDF: false
        }
    },
    computed: {
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.submission.id}/file`
        },
        submissionFileName() {
            if (this.submission) {
                return `${this.submission.file.name}${this.submission.file.extension}`
            } else {
                return ""
            }
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.fetchAssignment()
            this.viewPDF = false
            await this.fetchSubmission()
            this.viewPDF = true
        },
        async fetchAssignment() {
            // Fetch the assignment information.
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchSubmission() {
            const res = await api.submissions.get(this.$route.params.submissionId)
            this.submission = res.data
            this.commentChanged = false
        },
        async updateSubmissionApproval(approvalByTA) {
            await api.submissions.setApproval(this.submission.id, approvalByTA, this.submission.commentByTA)
            this.showSuccessMessage({ message: "Submission approval status changed" })
            await this.fetchSubmission()
        },
        goToAssignment() {
            if (this.$router.currentRoute.name.includes("teacher")) {
                this.$router.push({
                    name: "teacher-dashboard.assignments.assignment"
                })
            } else {
                this.$router.push({
                    name: "teaching-assistant-dashboard.course.assignment"
                })
            }
        },
        async goToNextFinalSubmissionWithoutApproval() {
            const submissions = []
            for (const assignmentVersion of this.assignment.versions) {
                const res = await api.submissions.getAllForAssignmentVersion(assignmentVersion.id)
                submissions.push(...res.data)
            }
            const finalSubmissionsWithoutApproval = _.filter(submissions, submission => {
                return submission.final && submission.approvalByTA === null
            })
            if (finalSubmissionsWithoutApproval.length === 0) {
                this.showErrorMessage({ message: "No final submissions without approval are available" })
            } else {
                const randomSubmission = _.sample(finalSubmissionsWithoutApproval)
                this.$router.push({
                    name: this.$router.currentRoute.name,
                    params: { submissionId: randomSubmission.id }
                })
                location.reload()
            }
        }
    }
}
</script>
