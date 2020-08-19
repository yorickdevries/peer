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
            :items="groups"
            :fields="groupFields"
            :current-page="currentPage"
            :per-page="Number(perPage)"
            :filter="filter"
        >
            <!--Actions-->
            <template v-slot:cell(actions)="row">
                <!--Show Details-->
                <b-button size="sm" @click="showDetails(row)" class="mr-2">
                    {{ row.detailsShowing ? "Hide" : "Show" }} Group
                </b-button>
            </template>

            <!--Actions-->
            <template v-slot:row-details="row">
                <b-card>
                    <dt>Group Members</dt>
                    <!--Table-->
                    <b-table
                        striped
                        outlined
                        show-empty
                        stacked="md"
                        :items="row.item.users"
                        :fields="userFields"
                    ></b-table>
                </b-card>
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination :total-rows="this.groups.length" :per-page="Number(perPage)" v-model="currentPage" class="my-0" />
    </div>
</template>

<script>
import notifications from "../../mixins/notifications"
import api from "../../api/api"

export default {
    mixins: [notifications],
    data() {
        return {
            groups: [],
            // for navigation
            groupFields: [
                { key: "id", label: "Group ID", sortable: true },
                { key: "name", label: "Group name", sortable: true },
                { key: "actions", label: "Actions" }
            ],
            userFields: [
                { key: "displayName", label: "Name" },
                { key: "netid", label: "NetID" },
                { key: "email", label: "​​​Email" },
                { key: "studentNumber", label: "Studentnumber" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchGroups()
    },
    methods: {
        async fetchGroups() {
            let res = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
            this.groups = res.data
        },
        async showDetails(row) {
            const res = await api.groups.get(row.item.id)
            // set the users in the row element
            row.item.users = res.data.users
            row.toggleDetails()
        }
    }
}
</script>
