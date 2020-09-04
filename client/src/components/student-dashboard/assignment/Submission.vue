<template>
    <b-container fluid class="px-0">
        <b-row>
            <b-col>
                <!--Submission Information-->
                <b-card header="Submission" class="h-100">
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
                                    size="sm"
                                    variant="secondary"
                                    class="mr-2"
                                >
                                    Make final
                                </b-button>
                                <b-button
                                    v-else
                                    v-b-modal="`changeSubmissionToNotFinalModal${data.item.id}`"
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
                        </b-table>
                        Only the final submission will be used for reviewing
                        <br /><br />
                    </div>
                    <b-alert v-else show variant="danger">You have not yet made a submission</b-alert>

                    <!-- Modal Button -->
                    <b-button
                        v-b-modal="`uploadModal${assignment.id}`"
                        :disabled="assignment.state !== 'submission'"
                        variant="primary"
                        @click="resetFile"
                        >Upload new Submission</b-button
                    >

                    <!-- Upload Modal-->
                    <b-modal
                        :id="`uploadModal${assignment.id}`"
                        ref="uploadModal"
                        centered
                        hide-footer
                        title="Upload Submission"
                    >
                        <b-alert show variant="warning"
                            >If you have already uploaded a file, it will be used for reviewing anymore!
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
            assignment: {},
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
                { key: "action", label: "Action" }
            ]
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchGroup()
        await this.fetchSubmissions()
    },
    methods: {
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchSubmissions() {
            const res = await api.assignments.getSubmissions(this.$route.params.assignmentId, this.group.id)
            this.submissions = res.data
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
            await this.fetchSubmissions()
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
