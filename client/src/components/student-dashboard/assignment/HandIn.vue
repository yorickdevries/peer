<template>
    <b-container fluid class="px-0">
        <b-row>
            <!--Hand-In Form-->
            <b-col>
                <!--Submission Information-->
                <b-card header="Submission" class="h-100">
                    <b-alert show variant="secondary">Allowed file types: .pdf/.zip/.doc/.docx</b-alert>
                    <b-alert v-if="hasUploadedSubmission" show variant="success">
                        <dl class="mb-0">
                            <dt>This is the latest submission you have made:</dt>
                            <dd></dd>
                            <dt>File</dt>
                            <dd>
                                <a :href="submissionFilePath" target="_blank">{{ submission.file_path }}</a>
                            </dd>
                            <dt>Submitted by</dt>
                            <dd>{{ submission.user_netid }}</dd>
                            <dt>Date</dt>
                            <dd>{{ submission.date | formatDate }}</dd>
                        </dl>
                    </b-alert>
                    <b-alert v-else show variant="danger">You have not yet made a submission</b-alert>

                    <!-- Modal Button -->
                    <b-button v-b-modal="'uploadModal'" variant="primary" @click="onFileReset"
                        >Upload / Overwrite Submission</b-button
                    >

                    <!-- Upload Modal-->
                    <b-modal id="uploadModal" ref="uploadModal" centered hide-footer title="Upload Submission">
                        <b-alert show variant="warning"
                            >If you have already uploaded a file, it will be overwritten!
                        </b-alert>
                        <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />

                        <b-form-file
                            placeholder="Choose a file..."
                            accept=".pdf,.zip,.doc,.docx"
                            v-model="file"
                            :state="Boolean(file)"
                            ref="fileInput"
                        />
                        <b-button variant="primary" class="mt-3" @click="submitSubmission()">Upload</b-button>
                    </b-modal>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api_old"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            file: null,
            fileProgress: 0,
            acceptFiles: ".pdf,.zip,.doc,.docx",
            submission: {
                user_netid: null,
                assignment_id: null,
                file_path: null,
                date: null
            },
            assignment: {
                title: null,
                description: null,
                due_date: null,
                publish_date: null,
                id: null,
                course_id: null,
                filename: ""
            }
        }
    },
    computed: {
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.submission.id}/file`
        },
        hasUploadedSubmission() {
            // Returns whether an submission has been uploaded or not.
            return this.submission.id !== undefined
        }
    },
    async created() {
        // Fetch assignment & submission.
        await this.fetchAssignment()
        await this.fetchSubmission()
    },
    methods: {
        async submitSubmission() {
            // Create the form data with the file.
            let formData = new FormData()
            formData.append("assignmentId", this.assignment.id)
            formData.append("submissionFile", this.file)

            // Config set for the HTTP request & updating the progress field.
            let config = {
                "Content-Type": "multipart/form-data",
                onUploadProgress: progressEvent => {
                    this.fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                }
            }

            // Perform upload.
            try {
                await api.client.post("/submissions", formData, config)
                this.showSuccessMessage({ message: "Successfully submitted new submission." })
                this.$refs.uploadModal.hide()
            } catch (e) {
                this.showErrorMessage({ message: `Did not upload file. ${e.response.data.error}` })
                this.$refs.uploadModal.hide()
            }

            // Clear file.
            this.onFileReset()

            // Re-fetch new submission.
            await this.fetchSubmission()
        },
        async fetchAssignment() {
            // Fetch the assignment.
            let res = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchSubmission() {
            // Fetch the submission.
            let res = await api.getAssignmentLatestSubmission(this.assignment.id)

            // If submission is not available, clear it.
            if (!res.data.error) {
                this.submission = res.data
            } else {
                this.onSubmissionReset()
            }
        },
        onFileReset() {
            // Reset the upload modal state.
            this.fileProgress = 0
            this.file = null
            this.$refs.fileInput.reset()
        },
        onSubmissionReset() {
            this.submission = {
                user_netid: null,
                assignment_id: null,
                file_path: null
            }
        }
    }
}
</script>
