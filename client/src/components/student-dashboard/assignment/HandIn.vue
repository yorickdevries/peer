<template>
    <b-container fluid class="px-0">
        <b-row>

            <!--Assignment Details-->
            <b-col>
                <b-card header="Assignment Details" class="h-100">
                <span class="font-weight-bold">Description</span>
                <p>
                    {{ assignment.description }}
                </p>
                <b-button variant="primary w-100">Download Assignment</b-button>
                </b-card>
            </b-col>

            <!--Hand-In Form-->
            <b-col>

                <!--Submission Information-->
                <b-card header="Hand-In Assignment" class="h-100">
                    <b-alert show variant="secondary">PDF files only.</b-alert>
                    <b-alert v-if="hasUploadedSubmission" show variant="success">You currently have submitted the file:
                        <br><a :href="submissionFilePath" :download="submission.file_path">{{ submission.file_path }}</a>
                    </b-alert>
                    <b-alert v-else show variant="danger">You have not yet made a submission</b-alert>

                    <!-- Modal Button -->
                    <b-button v-b-modal="'uploadModal'"
                              variant="primary"
                              @click="resetUploadModal">
                        Upload / Overwrite File
                    </b-button>

                    <!-- Upload Modal-->
                    <b-modal    id="uploadModal"
                                centered
                                hide-footer
                                title="Upload Submission">

                        <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />

                        <b-alert show v-if="uploadSuccess === true">Upload was successful.</b-alert>
                        <b-alert show v-if="uploadSuccess === false">Something went wrong with uploading. Try again.</b-alert>

                        <b-form-file
                                placeholder="Choose a file..."
                                accept=".pdf"
                                v-model="file"
                                :state="Boolean(file)"
                                v-if="uploadSuccess === null" />
                        <b-button
                                variant="primary"
                                class="mt-3"
                                @click="submitSubmission()"
                                v-if="uploadSuccess === null">Upload</b-button>

                    </b-modal>
                </b-card>
            </b-col>

        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api"

export default {
    async created() {
        // Fetch assignment & submission (if it exists).
        await this.fetchAssignment()
        await this.fetchSubmission()
    },
    data() {
        return {
            file: true,
            fileProgress: 0,
            uploadSuccess: null,
            acceptFiles: ".pdf",
            submission: {
                user_netid: null,
                assignment_id: null,
                file_path: null
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
            // Whether a (first) submission has been made to this assignment.
            return this.submission.id !== undefined
        }
    },
    methods: {
        async submitSubmission() {

            // Create the form data with the file.
            let formData = new FormData()
            formData.append("assignmentId", this.assignment.id)
            formData.append("submissionFile", this.file)

            // Config set for the HTTP request & updating the progress field.
            let config = {
                'Content-Type': 'multipart/form-data',
                onUploadProgress: (progressEvent) => {
                    this.fileProgress = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                }
            };

            // Perform upload.
            let res = await api.client.post("/submissions", formData, config)

            // Check whether upload was successful or not.
            res.data.error === undefined ? this.uploadSuccess = true : this.uploadSuccess = false

            console.log(res)
        },
        async deleteSubmission() {
            // Delete the current submission.
            await api.deleteSubmission(this.submission.id)
        },
        async fetchSubmission() {
            // Get the current submission (hardcoded for now).
            let res = await api.getSubmission(4)
            this.submission = res.data
        },
        async fetchAssignment() {
            // Fetch the assignment.
            let res = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        resetUploadModal() {
            // Reset the upload modal state.
            this.fileProgress = 0
            this.file = false
            this.uploadSuccess = null
        }
    }
}
</script>
