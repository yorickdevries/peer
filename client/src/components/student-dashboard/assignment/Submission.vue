<template>
    <b-container v-if="assignmentVersion" fluid class="px-0">
        <!--Submission Information-->
        <b-card
            :header="`Submission for Assignment version: ${assignmentVersion.name} (ID: ${assignmentVersion.id})`"
            class="h-100"
        >
            <b-row>
                <b-col>
                    <div v-if="submissions.length > 0">
                        <dt>These are the submission you have made:</dt>
                        <b-table
                            striped
                            outlined
                            show-empty
                            stacked="md"
                            :items="submissions"
                            :fields="submissionFields"
                        >
                            <template v-slot:cell(file)="data">
                                <a :href="submissionFilePath(data.item.id)" target="_blank">
                                    {{ data.item.file.name }}{{ data.item.file.extension }}
                                </a>
                            </template>
                            <template v-slot:cell(date)="data">
                                {{ data.item.createdAt | formatDate }}
                            </template>
                            <!--Actions-->
                            <template v-slot:cell(action)="data">
                                <!--Trigger final /  not final-->
                                <b-button
                                    v-if="!data.item.final"
                                    v-b-modal="`changeSubmissionToFinalModal${data.item.id}`"
                                    :disabled="!isSubmissionActive"
                                    size="sm"
                                    variant="secondary"
                                    class="mr-2"
                                >
                                    Make final
                                </b-button>
                                <b-button
                                    v-else
                                    v-b-modal="`changeSubmissionToNotFinalModal${data.item.id}`"
                                    :disabled="!isSubmissionActive"
                                    size="sm"
                                    variant="danger"
                                    class="mr-2"
                                    >Make not final
                                </b-button>
                                <b-modal
                                    :id="`changeSubmissionToFinalModal${data.item.id}`"
                                    @ok="changeSubmissionToFinal(data.item.id)"
                                    title="Confirmation"
                                    centered
                                >
                                    Are you sure you want to make this submission final? This means the other final
                                    submissions of the group will be set to non-final.
                                </b-modal>
                                <b-modal
                                    :id="`changeSubmissionToNotFinalModal${data.item.id}`"
                                    @ok="changeSubmissionToNotFinal(data.item.id)"
                                    title="Confirmation"
                                    centered
                                >
                                    Are you sure you want to make this submission not final anymore? This means you will
                                    not participate in the reviews.
                                </b-modal>
                            </template>

                            <template v-slot:cell(taFeedback)="row">
                                <b-button v-if="row.item.approvalByTA !== null" size="sm" @click="row.toggleDetails">
                                    {{ row.detailsShowing ? "Hide" : "Show" }} Feedback
                                </b-button>
                            </template>
                            <template v-slot:row-details="row">
                                <b-card>
                                    <!--Approval-->
                                    <dt>Current approval status</dt>
                                    <dd v-if="row.item.approvalByTA">Approved 👍</dd>
                                    <dd v-if="row.item.approvalByTA === false">Disapproved 👎</dd>
                                    <dd v-if="row.item.approvalByTA === null">No action yet by any TA.</dd>
                                    <dt>Current TA Comment</dt>
                                    <b-form-textarea
                                        :rows="10"
                                        :max-rows="15"
                                        v-model="row.item.commentByTA"
                                        readonly
                                    />
                                </b-card>
                            </template>
                        </b-table>
                        Only the final submission will be used for reviewing
                        <br />
                    </div>
                    <b-alert v-else show variant="danger"
                        >You have not yet made a submission for this assignment version</b-alert
                    >
                    <b-alert show variant="warning">Maximum file size for submission: 50MB</b-alert>

                    <!-- Modal Button -->
                    <b-button
                        v-b-modal="`uploadModal${assignmentVersion.id}`"
                        :disabled="!isSubmissionActive"
                        variant="primary"
                        @click="resetFile"
                        >Upload new Submission</b-button
                    >

                    <!-- Upload Modal-->
                    <b-modal
                        :id="`uploadModal${assignmentVersion.id}`"
                        ref="uploadModal"
                        centered
                        hide-footer
                        title="Upload Submission"
                    >
                        Assignment version:
                        <b-badge pill>{{ assignmentVersion.name }} (ID: {{ assignmentVersion.id }})</b-badge>
                        <hr />
                        <b-alert show variant="warning"
                            >If you have already uploaded a file, it will not be used for reviewing anymore!
                        </b-alert>
                        <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />
                        <b-alert show variant="secondary"
                            >Allowed file types: {{ assignment.submissionExtensions }}</b-alert
                        >
                        <b-form-file
                            v-model="file"
                            :accept="assignment.submissionExtensions"
                            placeholder="Choose a file..."
                            required
                            :state="Boolean(file)"
                        />
                        <b-button variant="primary" class="mt-3" :disabled="buttonDisabled" @click="submitSubmission()"
                            >Upload</b-button
                        >
                    </b-modal>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <dt>You can view your final submission here:</dt>
                    <div v-if="finalSubmission && finalSubmission.file.extension === '.pdf'">
                        <b-alert show variant="secondary"
                            >In case the viewer shows any errors, your .pdf is malformed and no pdf annotations can be
                            made by your reviewers directly in the browser. Reviewers can always download the file
                            instead.</b-alert
                        >
                        <PDFAnnotator :submissionId="finalSubmission.id" :readOnly="true"></PDFAnnotator>
                    </div>
                    <div v-else>
                        <b-alert show variant="secondary">
                            Your final submission is not a .pdf file, so it will not be rendered in the browser</b-alert
                        >
                    </div>
                </b-col>
            </b-row>
        </b-card>
    </b-container>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import PDFAnnotator from "./PDFAnnotator"
import notifications from "../../../mixins/notifications"

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    components: { PDFAnnotator },
    data() {
        return {
            assignment: null,
            assignmentVersion: null,
            // new file to upload
            file: null,
            fileProgress: 0,
            // existing data
            group: {},
            submissions: [],
            submissionFields: [
                { key: "id", label: "ID", sortable: true },
                { key: "file", label: "File" },
                { key: "userNetid", label: "Submitted by" },
                { key: "date", label: "​​​Date" },
                { key: "final", label: "Final" },
                { key: "action", label: "Action" },
                { key: "taFeedback", label: "TA Feedback" }
            ],
            buttonDisabled: false
        }
    },
    computed: {
        isSubmissionActive() {
            return (
                this.assignment.state === "submission" &&
                // either late submission must be enabled or the due date should not have been passed
                (this.assignment.lateSubmissions || new Date() < new Date(this.assignment.dueDate))
            )
        },
        finalSubmission() {
            return _.find(this.submissions, submission => {
                return submission.final
            })
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchAssignmentVersion()
        await this.fetchGroup()
        await this.fetchSubmissions()
    },
    methods: {
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchAssignmentVersion() {
            const res = await api.assignmentversions.get(this.assignmentVersionId)
            this.assignmentVersion = res.data
        },
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchSubmissions() {
            this.submissions = []
            const res = await api.assignmentversions.getSubmissions(this.assignmentVersion.id, this.group.id)
            this.submissions = res.data
        },
        async submitSubmission() {
            this.buttonDisabled = true
            if (!this.file) {
                this.showErrorMessage({ message: "No file selected" })
                this.buttonDisabled = false
                return
            }
            // Config set for the HTTP request & updating the progress field.
            let config = {
                "Content-Type": "multipart/form-data",
                onUploadProgress: progressEvent => {
                    this.fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                }
            }
            // Perform upload.
            try {
                await api.submissions.post(this.group.id, this.assignmentVersionId, this.file, config)
                this.showSuccessMessage({ message: "Successfully submitted submission." })
            } catch (error) {
                this.buttonDisabled = false
                return
            }
            this.$refs.uploadModal.hide()

            // Reset and fetch new submission.
            this.resetFile()
            await this.fetchSubmissions()
            this.buttonDisabled = false
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        },
        resetFile() {
            // Reset the upload modal state.
            this.fileProgress = 0
            this.file = null
        },
        async changeSubmissionToFinal(id) {
            await api.submissions.patch(id, true)
            this.showSuccessMessage({ message: "Set submission as final" })
            await this.fetchSubmissions()
        },
        async changeSubmissionToNotFinal(id) {
            await api.submissions.patch(id, false)
            this.showSuccessMessage({ message: "Set submission as not final" })
            await this.fetchSubmissions()
        }
    }
}
</script>
