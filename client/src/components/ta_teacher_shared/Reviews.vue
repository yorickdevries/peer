<template>
    <div>
        <!--Table Options-->
        <b-row>
            <b-col cols="6" class="mb-3">
                <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                    <b-input-group>
                        <b-form-input v-model="filter" placeholder="Type to search" />
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
                                'text-white': onlySubmittedReviews === null
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
                                'text-white': onlySubmittedReviews === true
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
                                'text-white': onlySubmittedReviews === false
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
        >
            <template v-slot:cell(submissionFile)="data">
                <a :href="submissionFilePath(data.item.submission.id)" target="_blank">
                    {{ data.item.submission.file.name }}{{ data.item.submission.file.extension }}
                </a>
            </template>

            <template v-slot:cell(submissionGroupName)="data">
                {{ getGroup(data.item.submission.groupId).name }}
            </template>

            <template v-slot:cell(approvalByTA)="data">
                <span v-if="data.item.approvalByTA === null">No action yet by any TA</span>
                <span v-if="data.item.approvalByTA === true">Approved</span>
                <span v-if="data.item.approvalByTA === false">Disapproved</span>
            </template>

            <template v-slot:cell(approvingTA)="data">
                <span v-if="data.item.approvingTA">{{ data.item.approvingTA }}</span>
                <span v-if="data.item.approvingTA === null">None</span>
            </template>

            <template v-slot:cell(action)="data">
                <b-button variant="primary" size="sm" :to="{ name: null, params: { reviewId: data.item.id } }"
                    >See review (TODO)</b-button
                >
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination
            :total-datas="this.selectedReviews.length"
            :per-page="Number(perPage)"
            v-model="currentPage"
            class="my-0"
        />
    </div>
</template>

<script>
import api from "../../api/api"
import _ from "lodash"

export default {
    data() {
        return {
            reviews: [],
            // groups to get groupName from
            groups: [],
            // in case of null, all reviews will be shown
            onlySubmittedReviews: null,
            // for navigation
            fields: [
                { key: "reviewer.netid", label: "Reviewer" },
                { key: "submissionFile", label: "Submission file" },
                { key: "submission.groupId", label: "Group ID of submission" },
                { key: "submissionGroupName", label: "Group name of submission" },
                { key: "flaggedByReviewer", label: "Reviewer flagged the submission" },
                { key: "submitted", label: "Review submitted" },
                { key: "approvalByTA", label: "Approval by TA" },
                { key: "approvingTA", label: "Approving TA" },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        // reviews
        const res1 = await api.reviewofsubmissions.getAllForAssignment(this.$route.params.assignmentId, undefined)
        this.reviews = res1.data
        // groups
        const res2 = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
        this.groups = res2.data
    },
    computed: {
        selectedReviews() {
            if (this.onlySubmittedReviews === null) {
                return this.reviews
            } else {
                return _.filter(this.reviews, review => {
                    return review.submitted === this.onlySubmittedReviews
                })
            }
        }
    },
    methods: {
        getGroup(id) {
            return _.find(this.groups, group => {
                return group.id === id
            })
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        }
    }
}
</script>
