<template>
    <div v-if="reviews">
        <b-row v-if="$router.currentRoute.name.includes('teacher')">
            <b-col>
                <!--Exporting Reviews-->
                <dt>Export reviews</dt>
                <dd>Exports a file with all reviews for this assignment.</dd>
                <dd>Also includes any evaluations which students have given on eachother's reviews.</dd>
                <b-button
                    :disabled="disableReviewExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportReviews('csv')"
                    class="mb-3 mr-2"
                >
                    Export reviews .csv
                </b-button>
                <b-button
                    :disabled="disableReviewExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportReviews('xls')"
                    class="mb-3 mr-2"
                >
                    Export reviews .xls
                </b-button>
            </b-col>
            <b-col>
                <!--Exporting Grades-->
                <dt>Export grades</dt>
                <dd>
                    Exports a file with an aggregation of the review approval/disapproval numbers of each student for
                    this assignment.
                </dd>
                <b-button
                    :disabled="disableGradeExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportGrades('csv')"
                    class="mb-3 mr-2"
                >
                    Export grades .csv
                </b-button>
                <b-button
                    :disabled="disableGradeExportButton"
                    size="sm"
                    variant="primary"
                    @click="exportGrades('xls')"
                    class="mb-3 mr-2"
                >
                    Export grades .xls
                </b-button>
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
                            @click="onlySubmittedReviews = null"
                            :class="{
                                'bg-primary': onlySubmittedReviews === null,
                                'btn-outline-primary': onlySubmittedReviews !== null,
                                'text-white': onlySubmittedReviews === null,
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            All reviews
                        </button>
                        <button
                            @click="onlySubmittedReviews = true"
                            :class="{
                                'bg-primary': onlySubmittedReviews === true,
                                'btn-outline-primary': onlySubmittedReviews !== true,
                                'text-white': onlySubmittedReviews === true,
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            Submitted reviews
                        </button>
                        <button
                            @click="onlySubmittedReviews = false"
                            :class="{
                                'bg-primary': onlySubmittedReviews === false,
                                'btn-outline-primary': onlySubmittedReviews !== false,
                                'text-white': onlySubmittedReviews === false,
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            Unsubmitted reviews
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
        <!--Table-->
        <b-table
            striped
            outlined
            show-empty
            stacked="md"
            :items="selectedReviews"
            :fields="fields"
            :current-page="currentPage"
            :per-page="Number(perPage)"
            :filter="filter"
            class="table-responsive"
        >
            <template v-slot:cell(submissionFile)="data">
                <a :href="submissionFilePath(data.item.submission.id)" target="_blank">
                    {{ data.item.submission.file.name }}{{ data.item.submission.file.extension }}
                </a>
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
                            ? 'teacher-dashboard.assignments.assignment.review'
                            : 'teaching-assistant-dashboard.course.assignment.review',
                        params: { reviewId: data.item.id },
                    }"
                    >Show review</b-button
                >
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination
            :total-rows="this.selectedReviews.length"
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

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    data() {
        return {
            reviews: null,
            // in case of null, all reviews will be shown
            onlySubmittedReviews: null,
            // for navigation
            fields: [
                { key: "action", label: "Action" },
                { key: "reviewer.netid", label: "Reviewer" },
                { key: "submissionFile", label: "Submission file" },
                { key: "submissionGroupName", label: "Group name of submission", sortable: true },
                { key: "flaggedByReviewer", label: "Reviewer flagged the submission", sortable: true },
                { key: "submitted", label: "Review submitted", sortable: true },
                { key: "approvalByTA", label: "Approval by TA", sortable: true },
                { key: "approvingTA", label: "Approving TA" },
            ],
            currentPage: 1,
            perPage: 10,
            filter: "",
            disableReviewExportButton: false,
            disableGradeExportButton: false,
        }
    },
    async created() {
        // reviews
        try {
            const res1 = await api.reviewofsubmissions.getAllForAssignmentVersion(this.assignmentVersionId, undefined)
            const reviews = res1.data
            // set the full groups
            const res2 = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
            const groups = res2.data
            // set submissiongroups
            for (const review of reviews) {
                const submissionGroup = _.find(groups, (group) => {
                    return group.id === review.submission.groupId
                })
                if (submissionGroup) {
                    review.submissionGroupName = submissionGroup.name
                }
            }
            this.reviews = reviews
        } catch (error) {
            // in case no submissionquestionnaire is present, this call will result in an error
            this.reviews = []
        }
    },
    computed: {
        selectedReviews() {
            if (this.onlySubmittedReviews === null) {
                return this.reviews
            } else {
                return _.filter(this.reviews, (review) => {
                    return review.submitted === this.onlySubmittedReviews
                })
            }
        },
    },
    methods: {
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        },
        async exportReviews(exportType) {
            this.disableReviewExportButton = true
            await api.reviewofsubmissions.exportReviews(this.assignmentVersionId, exportType)
            this.showSuccessMessage({
                message: "Export is being generated, you can download it in the exports tab when ready",
            })
        },
        async exportGrades(exportType) {
            this.disableGradeExportButton = true
            await api.reviewofsubmissions.exportGrades(this.assignmentVersionId, exportType)
            this.showSuccessMessage({
                message: "Export is being generated, you can download it in the exports tab when ready",
            })
        },
    },
}
</script>
