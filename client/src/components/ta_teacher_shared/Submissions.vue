<template>
    <div v-if="allSubmissions && finalSubmissions && groups">
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
                            @click="onlyFinalSubmissions = false"
                            :class="{
                                'bg-primary': !onlyFinalSubmissions,
                                'btn-outline-primary': onlyFinalSubmissions,
                                'text-white': !onlyFinalSubmissions
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
                                'text-white': onlyFinalSubmissions
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
                {{ data.item.createdAt | formatDate }}
            </template>
            <!--Actions-->
            <template v-if="$router.currentRoute.name.includes('teacher')" v-slot:cell(action)="data">
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
                    Are you sure you want to make this submission final? This means the other final submissions of the
                    group will be set to non-final.
                </b-modal>
                <b-modal
                    :id="`changeSubmissionToNotFinalModal${data.item.id}`"
                    @ok="changeSubmissionToNotFinal(data.item.id)"
                    title="Confirmation"
                    centered
                >
                    Are you sure you want to make this submission not final anymore? This means the group will not
                    participate in the reviews.
                </b-modal>
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

export default {
    mixins: [notifications],
    data() {
        return {
            allSubmissions: null,
            finalSubmissions: null,
            // groups to get groupName from
            groups: null,
            // boolean to show all or only final submissions
            onlyFinalSubmissions: true,
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "file", label: "File" },
                { key: "groupId", label: "Group ID" },
                { key: "groupName", label: "Group name" },
                { key: "userNetid", label: "Submitted by" },
                { key: "date", label: "​​​Date" },
                { key: "final", label: "Final" },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchSubmissions()
        await this.fetchGroups()
    },
    computed: {
        selectedSubmissions() {
            if (this.onlyFinalSubmissions) {
                return this.finalSubmissions
            } else {
                return this.allSubmissions
            }
        }
    },
    methods: {
        async fetchSubmissions() {
            // all submissions
            const res1 = await api.submissions.getAllForAssignment(this.$route.params.assignmentId)
            this.allSubmissions = res1.data
            // final submissions
            const res2 = await api.submissions.getFinal(this.$route.params.assignmentId)
            this.finalSubmissions = res2.data
        },
        async fetchGroups() {
            const res = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
            this.groups = res.data
        },
        getGroup(id) {
            return _.find(this.groups, group => {
                return group.id === id
            })
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
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
