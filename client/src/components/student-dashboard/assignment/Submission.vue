<template>
    <b-container fluid class="px-0">
        <b-row>
            <b-col>
                <!--Submission Information-->
                <b-card header="Submission" class="h-100">
                    <b-alert v-if="latestSubmission" show variant="success">
                        <dl class="mb-0">
                            <dt>This is the latest submission you have made:</dt>
                            <dd></dd>
                            <dt>File</dt>
                            <dd>
                                <a :href="submissionFilePath" target="_blank">
                                    {{ latestSubmission.file.name }}{{ latestSubmission.file.extension }}
                                </a>
                            </dd>
                            <dt>Submitted by</dt>
                            <dd>{{ latestSubmission.userNetid }}</dd>
                            <dt>Date</dt>
                            <dd>{{ latestSubmission.updatedAt | formatDate }}</dd>
                        </dl>
                    </b-alert>
                    <b-alert v-else show variant="danger">You have not yet made a submission</b-alert>

                    <!-- Modal Button -->
                    <b-button v-b-modal="'uploadModal'" variant="primary" @click="resetFile"
                        >Upload / Overwrite Submission</b-button
                    >

                    <!-- Upload Modal-->
                    <b-modal id="uploadModal" ref="uploadModal" centered hide-footer title="Upload Submission">
                        <b-alert show variant="warning"
                            >If you have already uploaded a file, it will be overwritten!
                        </b-alert>
                        <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />
                        <b-alert show variant="secondary">Allowed file types: .pdf/.zip/.doc/.docx</b-alert>
                        <b-form-file
                            v-model="file"
                            accept=".pdf,.zip,.doc,.docx"
                            placeholder="Choose a file..."
                            required
                            :state="Boolean(file)"
                        />
                        <b-button variant="primary" class="mt-3" @click="submitSubmission()">Upload</b-button>
                    </b-modal>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            // new file to upload
            file: null,
            fileProgress: 0,
            // existing data
            group: {},
            latestSubmission: null
        }
    },
    computed: {
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.latestSubmission.id}/file`
        }
    },
    async created() {
        await this.fetchGroup()
        await this.fetchLatestSubmission()
    },
    methods: {
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchLatestSubmission() {
            // Fetch the submission.
            const res = await api.assignments.getLatestSubmission(this.$route.params.assignmentId, this.group.id)
            this.latestSubmission = res.data
        },
        async submitSubmission() {
            if (!this.file) {
                this.showErrorMessage({ message: "No file selected" })
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
            await api.submissions.post(this.group.id, this.$route.params.assignmentId, this.file, config)
            this.showSuccessMessage({ message: "Successfully submitted submission." })
            this.$refs.uploadModal.hide()

            // Reset and fetch new submission.
            this.resetFile()
            await this.fetchLatestSubmission()
        },
        resetFile() {
            // Reset the upload modal state.
            this.fileProgress = 0
            this.file = null
        }
    }
}
</script>
