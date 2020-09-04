<template>
    <div v-if="allSubmissions && latestSubmissions && groups">
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
                            @click="onlyLatestSubmissions = false"
                            :class="{
                                'bg-primary': !onlyLatestSubmissions,
                                'btn-outline-primary': onlyLatestSubmissions,
                                'text-white': !onlyLatestSubmissions
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            All submissions
                        </button>
                        <button
                            @click="onlyLatestSubmissions = true"
                            :class="{
                                'bg-primary': onlyLatestSubmissions,
                                'btn-outline-primary': !onlyLatestSubmissions,
                                'text-white': onlyLatestSubmissions
                            }"
                            class="btn btn-sm"
                            size="sm"
                        >
                            Latest submissions
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

export default {
    data() {
        return {
            allSubmissions: null,
            latestSubmissions: null,
            // groups to get groupName from
            groups: null,
            // boolean to show all or only latest
            onlyLatestSubmissions: true,
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "file", label: "File" },
                { key: "groupId", label: "Group ID" },
                { key: "groupName", label: "Group name" },
                { key: "userNetid", label: "Submitted by" },
                { key: "date", label: "​​​Date" }
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
            if (this.onlyLatestSubmissions) {
                return this.latestSubmissions
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
            // latest submissions
            const res2 = await api.submissions.getSubmissionsToUseForReview(this.$route.params.assignmentId)
            this.latestSubmissions = res2.data
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
        }
    }
}
</script>
