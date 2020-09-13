<template>
    <div v-if="allSubmissions && finalSubmissions && groups">
        <b-alert show>As teacher you can change submissions for groups in the group tab</b-alert>
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
                { key: "final", label: "Final" }
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
        },
        finalSubmissions() {
            return _.filter(this.allSubmissions, function(submission) {
                return submission.final
            })
        }
    },
    methods: {
        async fetchSubmissions() {
            // all submissions
            const res1 = await api.submissions.getAllForAssignment(this.$route.params.assignmentId)
            this.allSubmissions = res1.data
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
