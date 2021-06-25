<template>
    <b-card header="Import Submissions">
        <b-alert class="d-flex justify-content-between flex-wrap" show variant="primary">
            <p>To import submissions for an assignment from WebLab:</p>
            <ol>
                <li>
                    Manually export submissions by downloading them via the <b>"Actions"</b> menu, located at the top
                    right-hand corner of the target assignment webpage on WebLab, where there is an option to
                    <b>"Download Submissions"</b>.
                </li>
                <li>
                    Format the downloaded submissions into a single zip file, that has a folder called
                    <b>"submissions"</b> containing all submissions. Where each submission should be in a separate
                    subfolder using the following format: <b>"StudentNumber_FirstName_LastName"</b>.
                </li>
                <li>
                    Use the file browser below to locate and upload the formatted zip file.
                </li>
            </ol>
            <p>Note: the importing of submissions can <b>only</b> be perform when:</p>
            <ul>
                <li>The assignment is not passed the Submission stage.</li>
                <li>The assignment is not self enrollable.</li>
                <li>No groups or submissions already exist for the assignmnet.</li>
                <li>
                    The corresponding students must already exist in the Peer database, i.e. they must have logged into
                    Peer at least once.
                </li>
                <li>The file size of the formatted zip file is at most 50 MB.</li>
            </ul>
        </b-alert>
        <!--File upload-->
        <b-form-group label="Zip file from WebLab" class="mb-0">
            <b-form-file
                v-model="file"
                accept=".zip"
                placeholder="Choose a .zip file..."
                required
                :state="Boolean(file)"
            >
            </b-form-file>
            <div class="modal-footer">
                <b-button variant="primary" class="mt-2 mr-auto" @click="importSubmissions">
                    Import submissions
                </b-button>
                <b-button variant="secondary" class="mt-2" @click="closeModal">Close</b-button>
            </div>
        </b-form-group>
    </b-card>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["modalId", "assignmentVersionId"],
    data() {
        return {
            file: null
        }
    },
    methods: {
        async importSubmissions() {
            this.disableSubmissionImportButton = true
            await api.submissions.import(this.assignmentVersionId, this.file)
            this.showSuccessMessage({ message: "Submissions are being imported" })
            this.closeModal()
        },
        async closeModal() {
            this.$bvModal.hide(this.modalId)
        }
    }
}
</script>
