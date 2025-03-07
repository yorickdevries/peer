<template>
    <div v-if="allSubmissions && finalSubmissions && groups">
        <b-alert show>As teacher you can change submissions for groups in the group tab</b-alert>
        <b-row v-if="$router.currentRoute.name.includes('teacher')">
            <b-col>
                <!--Exporting Submissions-->
                <dt>Export submissions</dt>
                <dd>Exports a file with info of all submissions for this assignment.</dd>
                <b-button
                    :disabled="disableSubmissionExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportSubmissions('csv')"
                    class="mb-3 mr-2"
                >
                    Export submissions .csv
                </b-button>
                <b-button
                    :disabled="disableSubmissionExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportSubmissions('xls')"
                    class="mb-3 mr-2"
                >
                    Export submissions .xls
                </b-button>
                <b-button
                    :disabled="disableSubmissionExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportAllSubmissions()"
                    class="mb-3 mr-2"
                >
                    Export all submissions .zip
                </b-button>
            </b-col>
            <b-col v-if="assignment.assignmentType === 'code'">
                <template v-if="assignment.enrollable">
                    <dt>Import submissions from WebLab</dt>
                    <dd>
                        Not available. On creation of the assignment, this assignment has been set as self-enrollable.
                    </dd>
                </template>
                <template v-else-if="assignment.state !== 'unpublished' && assignment.state !== 'submission'">
                    <dt>Import submissions from WebLab</dt>
                    <dd>Not available. The assignment is already past the submission state.</dd>
                </template>
                <template v-else-if="!/\.zip($|[\s,])/.test(assignment.submissionExtensions)">
                    <dt>Import submissions from WebLab</dt>
                    <dd>Not available. On creation of the assignment, .zip extensions have not been allowed.</dd>
                </template>
                <template v-else>
                    <!--Importing Submissions-->
                    <dt>Import submissions from WebLab</dt>
                    <dd>This action will import the submissions from WebLab in this assignment version.</dd>
                    <b-button
                        v-b-modal="`importSubmissions${assignmentVersionId}`"
                        variant="primary"
                        size="sm"
                        class="mb-3"
                    >
                        Import WebLab submissions .zip
                    </b-button>

                    <!--Import Sumbissions Modal-->
                    <b-modal
                        :id="`importSubmissions${assignmentVersionId}`"
                        :assignmentVersionId="assignmentVersionId"
                        centered
                        hide-header
                        hide-footer
                        class="p-0 m-0"
                        size="lg"
                    >
                        <ImportSubmissionsWizard
                            :modalId="`importSubmissions${assignmentVersionId}`"
                            :assignmentVersionId="assignmentVersionId"
                        ></ImportSubmissionsWizard>
                    </b-modal>
                </template>
            </b-col>
        </b-row>
        <hr />
        <!--Table Options-->
        <b-row>
            <b-col cols="6" class="mb-3">
                <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                    <b-input-group>
                        <b-form-input v-model="filter" debounce="1000" placeholder="Type to search" />
                        <b-input-group-append>
                            <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                        </b-input-group-append>
                    </b-input-group>

                    <b-button-group class="mx-auto">
                        <button
                            @click="onlyFinalSubmissions = false"
                            :class="{
                                'bg-primary': !onlyFinalSubmissions,
                                'btn-outline-primary': onlyFinalSubmissions,
                                'text-white': !onlyFinalSubmissions,
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            All submissions
                        </button>
                        <button
                            @click="onlyFinalSubmissions = true"
                            :class="{
                                'bg-primary': onlyFinalSubmissions,
                                'btn-outline-primary': !onlyFinalSubmissions,
                                'text-white': onlyFinalSubmissions,
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            Final submissions
                        </button>
                    </b-button-group>
                </b-form-group>
            </b-col>
            <b-col cols="6">
                <b-form-group horizontal label="Per page">
                    <b-form-input type="number" v-model="perPage" />
                </b-form-group>
            </b-col>
        </b-row>
        <b-alert show> Number of submissions: {{ numberOfSubmissions }}</b-alert>
        <!--Table-->
        <b-table
            striped
            outlined
            show-empty
            stacked="md"
            :items="selectedSubmissions"
            :fields="fields"
            :current-page="currentPage"
            :per-page="Number(perPage)"
            :filter="filter"
            class="table-responsive"
        >
            <template v-slot:cell(file)="data">
                <a :href="submissionFilePath(data.item.id)" target="_blank">
                    {{ data.item.file.name }}{{ data.item.file.extension }}
                </a>
            </template>

            <template v-slot:cell(groupName)="data">
                {{ getGroup(data.item.groupId).name }}
            </template>

            <template v-slot:cell(date)="data">
                {{ data.item.createdAt | formatDateCompact }}
            </template>

            <template v-slot:cell(approvalByTA)="data">
                <span v-if="data.item.approvalByTA === null">No action yet by any TA</span>
                <span v-if="data.item.approvalByTA === true">Approved 👍</span>
                <span v-if="data.item.approvalByTA === false">Disapproved 👎</span>
            </template>

            <template v-slot:cell(approvingTA)="data">
                <span v-if="data.item.approvingTA">{{ data.item.approvingTA.netid }}</span>
                <span v-if="data.item.approvingTA === null">None</span>
            </template>

            <template v-slot:cell(action)="data">
                <!-- note: the name needs to be different for TAs-->
                <b-button
                    variant="primary"
                    size="sm"
                    :to="{
                        name: $router.currentRoute.name.includes('teacher')
                            ? 'teacher-dashboard.assignments.assignment.submission'
                            : 'teaching-assistant-dashboard.course.assignment.submission',
                        params: { submissionId: data.item.id },
                    }"
                    >Show submission</b-button
                >
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination
            :total-rows="this.selectedSubmissions.length"
            :per-page="Number(perPage)"
            v-model="currentPage"
            class="my-0"
        />
    </div>
</template>

<script>
import api from "../../api/api"
import _ from "lodash"
import notifications from "../../mixins/notifications"
import ImportSubmissionsWizard from "../teacher-dashboard/ImportSubmissionsWizard"

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    components: {
        ImportSubmissionsWizard,
    },
    data() {
        return {
            allSubmissions: null,
            numberOfSubmissions: 0,
            // groups to get groupName from
            groups: null,
            // boolean to show all or only final submissions
            onlyFinalSubmissions: true,
            // for navigation
            fields: [
                { key: "action", label: "Action" },
                { key: "file", label: "File" },
                { key: "groupName", label: "Group name", sortable: true },
                { key: "date", label: "Date" },
                { key: "final", label: "Final", sortable: true },
                { key: "reportedByReview", label: "Reported by Review", sortable: true },
                { key: "approvalByTA", label: "Approval by TA", sortable: true },
                { key: "approvingTA", label: "Approving TA" },
                { key: "flaggedByServer", label: "Flagged by server", sortable: true },
                { key: "commentByServer", label: "Comment by server" },
            ],
            currentPage: 1,
            perPage: 10,
            filter: "",
            disableSubmissionExportButton: false,
            assignment: null,
            reviews: null,
        }
    },
    async created() {
        await this.fetchReviews()
        await this.fetchGroups()
        await this.fetchSubmissions()
        await this.fetchAssignment()
    },
    computed: {
        selectedSubmissions() {
            if (this.onlyFinalSubmissions) {
                return this.finalSubmissions
            } else {
                return this.allSubmissions
            }
        },
        finalSubmissions() {
            return _.filter(this.allSubmissions, function (submission) {
                return submission.final
            })
        },
    },
    methods: {
        flagSubmissions() {
            const flaggedReviews = new Map()
            for (const review of this.reviews) {
                if (review.flaggedByReviewer) {
                    flaggedReviews.set(review.submission.id, true)
                }
            }
            return flaggedReviews
        },
        parseGroups() {
            const parsedGroups = new Map()
            for (const group of this.groups) {
                parsedGroups.set(group.id, group.name)
            }
            return parsedGroups
        },
        addSubmissionDetails(submissions) {
            const parsedGroups = this.parseGroups()
            const flaggedSubmissions = this.flagSubmissions()

            submissions.forEach((s) => {
                s.reportedByReview = flaggedSubmissions.has(s.id)
                s.groupName = parsedGroups.get(s.id)
            })

            return submissions
        },
        async fetchSubmissions() {
            // all submissions
            const res1 = await api.submissions.getAllForAssignmentVersion(this.assignmentVersionId)

            const submissions = res1.data

            //this.allSubmissions = submissions
            this.allSubmissions = this.addSubmissionDetails(submissions)

            let count = await api.submissions.getSubmissionCount(this.assignmentVersionId)
            this.numberOfSubmissions = count.data
        },
        async fetchGroups() {
            const res = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
            this.groups = res.data
        },
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchReviews() {
            const res = await api.reviewofsubmissions.getAllForAssignmentVersion(this.assignmentVersionId, true)
            this.reviews = res.data
        },
        getGroup(id) {
            return _.find(this.groups, (group) => {
                return group.id === id
            })
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        },
        async exportSubmissions(exportType) {
            this.disableSubmissionExportButton = true
            await api.submissions.export(this.assignmentVersionId, exportType)
            this.showSuccessMessage({
                message: "Export is being generated, you can download it in the exports tab when ready",
            })
        },
        async exportAllSubmissions() {
            await api.submissions.getZipExport(this.assignmentVersionId)
            this.showSuccessMessage({
                message: "Export is being generated, you can download it in the exports tab when ready",
            })
        },
    },
}
</script>
