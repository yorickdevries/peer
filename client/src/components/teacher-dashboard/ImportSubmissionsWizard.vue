<template>
    <b-card header="Import Submissions">
        <b-alert class="d-flex justify-content-between flex-wrap" show variant="primary">
            <p>Please upload a zip file with WebLab submissions, i.e. an assignment exported from WebLab</p>
            <ul class="mb-0">
                <li>The zip file should contain a folder called "submissions" containing all submissions</li>
                <li>
                    Each submission should be in a separate folder named with the format
                    "StudentNumber_FirstName_LastName"
                </li>
                <li>The file should have the extension .zip</li>
                <li>Max file size is 50MB</li>
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
            <b-button variant="primary" class="mt-3" @click="importSubmissions">Import submissions</b-button>
        </b-form-group>
    </b-card>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["assignmentVersionId"],
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
        }
    }
}
</script>
