<template>
    <!--Submission Information-->
    <b-card header="Submission" class="h-100">
        <b-alert show variant="secondary">PDF/ZIP files only.</b-alert>
        <b-alert v-if="hasUploadedSubmission" show variant="success">
            <dl class="mb-0">
                <dt>This is the latest file you uploaded for this question:</dt>
                <dd></dd>
                <dt>File</dt>
                <dd><a :href="uploadFilePath" target="_blank">{{ submission.file_path }}</a></dd>
                <dt>Date</dt>
                <dd>{{ submission.date | formatDate }}</dd>
            </dl>
        </b-alert>
        <b-alert v-else show variant="danger">You have not yet upload a file for this question.</b-alert>

        <!-- Modal Button -->
        <b-button   v-b-modal="'uploadModal'"
                    variant="primary"
                    @click="onFileReset">Upload / Overwrite Upload</b-button>

        <!-- Upload Modal-->
        <b-modal    id="uploadModal"
                    ref="uploadModal"
                    centered
                    hide-footer
                    title="Upload Submission">

            <b-alert show variant="warning">If you already have a file uploaded, this will overwrite the
                file!
            </b-alert>
            <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />

            <b-form-file
                    placeholder="Choose a file..."
                    accept= ".pdf,.zip"
                    v-model="file"
                    :state="Boolean(file)"
                    ref="fileInput"/>
            <b-button
                    variant="primary"
                    class="mt-3"
                    @click="submitSubmission()">Upload</b-button>
        </b-modal>

    </b-card>
</template>

<script>
    export default {
        name: "UploadQuestionForm",
        data() {
            return {
                file: null,
                fileProgress: 0,
                acceptFiles: ".pdf,.zip",
            }
        },
        computed: {
            uploadFilePath() {
                // Get the upload file path.
                return `/api/submissions/${this.submission.id}/file`
            },
            hasUploadedSubmission() {
                // Returns whether an file has been uploaded or not.
                return this.submission.id !== undefined
            }
        },
        methods: {
            async submitFIle() {

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
                let res
                try {
                    res = await api.client.post("/submissions", formData, config)
                    this.showSuccessMessage({message: 'Successfully submitted new submission.'})
                    this.$refs.uploadModal.hide()
                } catch (e) {
                    this.showErrorMessage({message: `Did not upload file. ${e.response.data.error}`})
                    this.$refs.uploadModal.hide()
                }

                // Clear file.
                this.onFileReset()

                // Emit that a file has been uploaded.
                this.$emit('fileuploadDone')
            },
            onFileReset() {
                // Reset the upload modal state.
                this.fileProgress = 0
                this.file = null
                this.$refs.fileInput.reset()
            },
        }
    }
</script>

