<template>
    <b-card header="Import Submissions">
        <b-alert class="d-flex justify-content-between flex-wrap" show variant="primary">
            <p>The importing of submissions can <b>only</b> be performed when:</p>
            <ul>
                <li>No groups or submissions already exist for the assignmnet.</li>
                <li>
                    The corresponding students must already exist in the Peer database, i.e. they must have logged into
                    Peer at least once.
                </li>
                <li>The file size at most 50 MB.</li>
            </ul>
            <p>To import submissions for an assignment from WebLab:</p>
            <ul>
                <li>
                    Manually export submissions by downloading them via the <b>"Actions"</b> menu, located at the top
                    right-hand corner of the target assignment webpage on WebLab, where there is an option to
                    <b>"Download Submissions"</b>.
                </li>
                <li>
                    The downloaded submissions should be in a single zip file, that has a folder called
                    <b>"submissions"</b> containing all submissions. Where each submission is in a separate subfolder
                    using the following format: <b>"StudentNumber_FirstName_LastName"</b>.
                </li>
            </ul>
            <p>
                Note: It may take time for the imported submissions to appear in the "Submissions" tab. If the import
                was unsuccessful, then you will be notified by email.
            </p>
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
            <b-button variant="primary" class="mt-3" @click="importSubmissions">Import submissions</b-button>
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
            // Close modal after submitting
            this.$bvModal.hide(this.modalId)
        }
    }
}
</script>
