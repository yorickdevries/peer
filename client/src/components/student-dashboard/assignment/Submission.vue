<template>
    <b-container v-if="assignmentVersion" fluid class="px-0">
        <!--Submission Information-->
        <b-card :header="`Submission for Assignment version: ${assignmentVersion.name}`" class="h-100">
            <b-row>
                <b-col>
                    <div v-if="submissions.length > 0">
                        <dt>These are the submissions you have made:</dt>
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
                            <template v-slot:cell(serverStatus)="data">
                                <dl>
                                    <dt v-if="data.item.flaggedByServer">⚠️ There might be a problem with this file</dt>
                                    <dd v-if="data.item.flaggedByServer === null">
                                        Your file was not checked by the server
                                    </dd>
                                </dl>
                                <dl>
                                    <dd v-if="data.item.flaggedByServer">
                                        Server's reason for flagging {{ data.item.commentByServer }}
                                    </dd>
                                </dl>
                            </template>
                            <!--Actions-->
                            <template v-slot:cell(action)="data">
                                <!--Trigger final /  not final-->
                                <b-button
                                    v-if="!data.item.final"
                                    v-b-modal="`changeSubmissionToFinalModal${data.item.id}`"
                                    :disabled="!isSubmissionActive"
                                    :title="
                                        isSubmissionActive
                                            ? null
                                            : 'You cannot change the final submission since the deadline has passed'
                                    "
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
                                    :title="
                                        isSubmissionActive
                                            ? null
                                            : 'You cannot change the final submission since the deadline has passed'
                                    "
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
                    <b-alert v-else show variant="danger">
                        You have not (yet) made a submission for this assignment version
                    </b-alert>
                    <div v-if="isSubmissionActive">
                        <b-alert show variant="danger">
                            You should never include any personal information in your submission files unless
                            specifically mentioned otherwise!
                        </b-alert>

                        <!-- Modal Button -->
                        <b-button
                            :disabled="!isSubmissionActive"
                            variant="primary"
                            @click="resetFile(assignmentVersion.id)"
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
                            <b-badge pill>{{ assignmentVersion.name }}</b-badge>
                            <hr />
                            <b-alert show variant="warning">
                                If you have already uploaded a file, it will not be used for reviewing anymore!
                            </b-alert>
                            <b-alert show variant="warning">
                                Please make sure you have not included personal information anywhere unless specifically
                                mentioned otherwise!
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

                            <b-button
                                variant="primary"
                                class="mt-3"
                                :disabled="buttonDisabled"
                                @click="submitSubmission()"
                                >Upload</b-button
                            >
                        </b-modal>

                        <!-- Upload Img Modal-->
                        <b-modal
                            :id="`uploadImgModal${assignmentVersion.id}`"
                            ref="uploadImgModal"
                            centered
                            hide-footer
                            title="Upload Submission"
                        >
                            Assignment version:
                            <b-badge pill>{{ assignmentVersion.name }}</b-badge>
                            <hr />
                            <b-alert show variant="warning">
                                If you have already uploaded a file, it will not be used for reviewing anymore!
                            </b-alert>
                            <b-alert show variant="warning">
                                Please make sure you have not included personal information anywhere unless specifically
                                mentioned otherwise!
                            </b-alert>
                            <b-progress :value="fileProgress" :animated="fileProgress !== 100" class="mb-3" />
                            <b-alert show variant="secondary">Allowed file types: image files</b-alert>

                            <b-card v-for="(file, index) in files" :key="index" class="mb-3">
                                <b-row class="d-flex justify-content-between">
                                    <b-col cols="2" class="mb-3 d-flex flex-column justify-content-between">
                                        <icon
                                            icon="fa-solid fa-angle-up"
                                            class="mr-2 align-middle"
                                            @click="moveImageUp(index)"
                                        ></icon>
                                        <icon
                                            icon="fa-solid fa-trash"
                                            class="mr-2 align-middle"
                                            @click="deleteImage(index)"
                                        ></icon>
                                        <icon
                                            icon="fa-solid fa-angle-down"
                                            class="mr-2 align-middle"
                                            @click="moveImageDown(index)"
                                        ></icon>
                                    </b-col>
                                    <b-col cols="10" class="mb-3">
                                        <b-img :src="file.src" fluid />
                                    </b-col>
                                </b-row>
                            </b-card>
                            <b-form-file
                                accept="image/*"
                                @input="uploadImage"
                                placeholder="Add an image"
                                ref="imgUploadButton"
                            />

                            <b-button
                                variant="primary"
                                class="mt-3"
                                :disabled="buttonDisabled"
                                @click="submitImageSubmission()"
                                >Upload</b-button
                            >
                        </b-modal>

                        <!-- Upload Type Modal-->
                        <b-modal
                            :id="`uploadTypeModal${assignmentVersion.id}`"
                            ref="uploadTypeModal"
                            centered
                            hide-footer
                            title="Select Upload Mode"
                        >
                                                        <b-alert show> Would you like to upload a PDF or several images from your phone? </b-alert>

                            </b-alert>
                                                        <b-alert show>
                                Images can be taken directly with the camera or selected from your gallery.
                            </b-alert>
                            </b-alert>

                            <b-container class="d-flex justify-content-between">
                                <b-button variant="primary" @click="selectUploadType('pdf')">Upload PDF</b-button>
                                <b-button variant="primary" @click="selectUploadType('img')">Upload Images</b-button>
                            </b-container>
                        </b-modal>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <dt v-if="!isMobile">You can view your final submission here:</dt>
                    <dt v-else>You can download your final submission by clicking on the filename above.</dt>
                    <div v-if="finalSubmission && !isMobile">
                        <b-alert v-if="finalSubmission.file.extension === '.pdf'" variant="secondary"
                            >In case the viewer shows any errors, your .pdf is malformed and no pdf annotations can be
                            made by your reviewers directly in the browser. Reviewers can always download the file
                            instead.</b-alert
                        >
                        <FileAnnotator
                            :submissionId="finalSubmission.id"
                            :assignmentType="assignment.assignmentType"
                            :readOnly="true"
                            :ignoreAnnotations="true"
                        />
                    </div>
                </b-col>
            </b-row>
        </b-card>
    </b-container>
</template>

<script>
import api from "../../../api/api"
import _ from "lodash"
import FileAnnotator from "./FileAnnotator"
import notifications from "../../../mixins/notifications"
import screenSize from "../../../mixins/screenSize"
import { jsPDF } from "jspdf"
export default {
    props: ["assignmentVersionId"],
    mixins: [notifications, screenSize],
    components: { FileAnnotator },
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
                { key: "serverStatus", label: "Server Status" },
                { key: "final", label: "Final" },
                { key: "action", label: "Action" },
                { key: "taFeedback", label: "TA Feedback" },
            ],
            buttonDisabled: false,
            files: [],
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
            return _.find(this.submissions, (submission) => {
                return submission.final
            })
        },
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchAssignmentVersion()
        await this.fetchGroup()
        await this.fetchSubmissions()
    },
    methods: {
        uploadImage(file) {
            const img = new Image()
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                img.onload = () => {
                    this.files.push({
                        src: reader.result,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    })
                    this.$refs.imgUploadButton.reset()
                }
                img.src = reader.result
            })

            if (file) {
                reader.readAsDataURL(file)
            }
        },
        selectUploadType(selectType) {
            this.$bvModal.hide(`uploadTypeModal${this.assignment.id}`)
            if (selectType === "pdf") {
                this.$bvModal.show(`uploadModal${this.assignment.id}`)
            } else {
                this.$bvModal.show(`uploadImgModal${this.assignment.id}`)
            }
        },
        deleteImage(id) {
            this.files.splice(id, 1)
        },
        moveImageUp(id) {
            if (id === 0) return

            const vm = this
            const upImage = this.files[id - 1]
            const curImage = this.files[id]

            vm.$set(this.files, id, upImage)
            vm.$set(this.files, id - 1, curImage)
        },
        moveImageDown(id) {
            if (id === this.files.length - 1) {
                return
            }

            const vm = this
            const downImage = this.files[id + 1]
            const curImage = this.files[id]

            vm.$set(this.files, id, downImage)
            vm.$set(this.files, id + 1, curImage)
        },
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
                onUploadProgress: (progressEvent) => {
                    this.fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                },
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
        async submitImageSubmission() {
            this.buttonDisabled = true
            if (this.files.length === 0) {
                this.showErrorMessage({ message: "No image(s) selected" })
                this.buttonDisabled = false
                return
            }

            //pdf creation and conversion
            const firstImg = this.files[0]
            const doc = new jsPDF({
                orientation: firstImg.width > firstImg.height ? "l" : "p",
                unit: "px",
                format: [firstImg.width, firstImg.height],
                hotfixes: ["px_scaling"],
            })
            doc.addImage(firstImg.src, "", 0, 0, firstImg.width, firstImg.height)

            for (let i = 1; i < this.files.length; i++) {
                const curImg = this.files[i]
                doc.addPage([curImg.width, curImg.height], curImg.width > curImg.height ? "l" : "p")
                doc.addImage(curImg.src, "", 0, 0, curImg.width, curImg.height)
            }

            const outputBlob = doc.output("blob")
            console.log(outputBlob)
            this.file = new File([outputBlob], "submission.pdf")

            // Config set for the HTTP request & updating the progress field.
            let config = {
                "Content-Type": "multipart/form-data",
                onUploadProgress: (progressEvent) => {
                    this.fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                },
            }
            // Perform upload.
            try {
                await api.submissions.post(this.group.id, this.assignmentVersionId, this.file, config)
                this.showSuccessMessage({ message: "Successfully submitted submission." })
            } catch (error) {
                this.buttonDisabled = false
                return
            }
            this.$refs.uploadImgModal.hide()

            // Reset and fetch new submission.
            this.resetFile()
            await this.fetchSubmissions()
            this.buttonDisabled = false
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        },
        resetFile(id) {
            // Reset the upload modal state.
            this.fileProgress = 0
            this.file = null
            this.files = []

            // new submission button clicked
            if (id) {
                if (this.isMobile) {
                    this.$bvModal.show(`uploadTypeModal${id}`)
                } else {
                    this.$bvModal.show(`uploadModal${id}`)
                }
            }
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
        },
    },
}
</script>
