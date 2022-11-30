<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Assignments', assignment.name, 'Submissions', submission.id]" class="mt-3">
            </BreadcrumbTitle>

            <!--Next Submission-->
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between align-items-center">
                    <div>Submission information</div>
                    <div>
                        <b-button size="sm" variant="secondary" @click="$router.back()" class="mr-2"
                            >Back to Assignment
                        </b-button>
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
                            <dl>
                                <dt>Current server flagging status</dt>
                                <dd v-if="submission.flaggedByServer">Flagged as suspicious⚠️</dd>
                                <dd v-if="submission.flaggedByServer === false">Not flagged as suspicious✔️</dd>
                                <dd v-if="submission.flaggedByServer === null">No action by the server yet</dd>
                            </dl>
                            <dl>
                                <dt>Server's reason for flagging</dt>
                                <dd>{{ submission.commentByServer }}</dd>
                            </dl>
                            <dt>Current TA approval status</dt>
                            <dd v-if="submission.approvalByTA">Approved 👍</dd>
                            <dd v-if="submission.approvalByTA === false">Disapproved 👎</dd>
                            <dd v-if="submission.approvalByTA === null">No action yet by any TA</dd>
                            <dt>Current TA Comment</dt>
                            <b-form-textarea :rows="10" :max-rows="15" v-model="submission.commentByTA" readonly />
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <FileAnnotator
                                v-if="viewFile"
                                :submissionId="submission.id"
                                :assignmentType="assignment.assignmentType"
                                :readOnly="true"
                                :ignoreAnnotations="true"
                            />
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
                                >Disapprove 👎
                            </b-button>
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
                    <dl>
                        <b-alert :show="commentChanged" variant="warning"
                            >Comment changed, please don't forget to set approval to save</b-alert
                        >
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
import FileAnnotator from "../student-dashboard/assignment/FileAnnotator"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle, FileAnnotator },
    data() {
        return {
            assignment: {},
            submission: {},
            commentChanged: false,
            // dont view file until data is fetched
            viewFile: false
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
            this.viewFile = false
            await this.fetchSubmission()
            this.viewFile = true
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
