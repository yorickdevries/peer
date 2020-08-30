<template>
    <div>
        <b-row>
            <b-col>
                <!--Importing-->
                <template v-if="assignment.enrollable">
                    <dt>Import groups</dt>
                    <dd>
                        Not available. On creation of the assignment, this assignment has been set as self-enrollable.
                    </dd>
                </template>
                <template v-else>
                    <dt>Import groups</dt>
                    <dd>This action will import the groups in the assignment.</dd>
                    <b-button v-b-modal="'importGroups'" variant="primary" size="sm" class="mb-3"
                        >Import groups
                    </b-button>

                    <!--Import Group Modal-->
                    <b-modal id="importGroups" centered hide-header hide-footer class="p-0 m-0" size="lg">
                        <ImportGroupsWizard></ImportGroupsWizard>
                    </b-modal>
                </template>
            </b-col>
            <b-col>
                <!--Copying-->
                <template v-if="assignment.enrollable">
                    <dt>Copy groups</dt>
                    <dd>
                        Not available. On creation of the assignment, this assignment has been set as self-enrollable.
                    </dd>
                </template>
                <template v-else>
                    <dt>Copy groups</dt>
                    <dd>
                        This action will import the groups of another assignment to this assignment.
                    </dd>
                    <b-button v-b-modal="'copyGroups'" variant="primary" size="sm">Copy groups </b-button>
                    <b-modal id="copyGroups" centered hide-header hide-footer class="p-0 m-0" size="lg">
                        <CopyGroupsWizard></CopyGroupsWizard>
                    </b-modal>
                </template>
            </b-col>
        </b-row>
        <hr />
        <b-alert variant="danger" show>Modifying groups should be done with caution!</b-alert>
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

        <!--Create Group-->
        <b-row>
            <b-col class="mb-3">
                <b-button variant="success" v-b-modal.createGroup>Create Group</b-button>
            </b-col>
        </b-row>

        <b-modal id="createGroup" centered title="Create Group" @ok="createGroup()">
            <div>Group name:</div>
            <b-input v-model="newGroupName"></b-input>
        </b-modal>

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
                    {{ row.detailsShowing ? "Hide" : "Show" }} Edit Group
                </b-button>
                <!--Delete Group-->
                <b-button size="sm" @click="deleteGroup(row.item.id)" class="mr-2" variant="danger">
                    Delete Group
                </b-button>
            </template>

            <!--Actions-->
            <template v-slot:row-details="row">
                <b-card>
                    <dt>Group Members</dt>
                    <!--Table-->
                    <b-table striped outlined show-empty stacked="md" :items="row.item.users" :fields="userFields">
                        <template v-slot:cell(action)="data">
                            <b-button
                                variant="danger"
                                size="sm"
                                @click="removeUserFromGroup(row.item.id, data.item.netid)"
                                >Remove</b-button
                            >
                        </template>
                    </b-table>
                    <!--Add Group Member-->
                    <dt>Add Group Member</dt>
                    <dd class="d-flex">
                        <b-button
                            variant="success"
                            class="mr-2"
                            size="sm"
                            @click="addUserToGroup(row.item.id, newUserNetId)"
                            >Add Group Member</b-button
                        >
                        <b-input v-model="newUserNetId" placeholder="Enter valid NetID here."></b-input>
                    </dd>
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
import ImportGroupsWizard from "./ImportGroupsWizard"
import CopyGroupsWizard from "./CopyGroupsWizard"

export default {
    mixins: [notifications],
    components: {
        ImportGroupsWizard,
        CopyGroupsWizard
    },
    data() {
        return {
            assignment: null,
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
                { key: "studentNumber", label: "Studentnumber" },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: "",
            // add new group
            newGroupName: "",
            // add new user
            newUserNetId: ""
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchGroups()
    },
    methods: {
        async fetchAssignment() {
            let res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroups() {
            let res = await api.groups.getAllForAssignment(this.$route.params.assignmentId)
            this.groups = res.data
        },
        async createGroup() {
            if (this.newGroupName === "") {
                return this.showErrorMessage({ message: "Group name can't be empty." })
            }
            await api.groups.post(this.$route.params.assignmentId, this.newGroupName)
            this.newGroupName = ""
            await this.fetchGroups()
            this.showSuccessMessage({ message: "Succesfully created group." })
        },
        async deleteGroup(id) {
            await api.groups.delete(id)
            await this.fetchGroups()
            this.showSuccessMessage({ message: "Succesfully deleted group." })
        },
        async showDetails(row) {
            const res = await api.groups.get(row.item.id)
            // set the users in the row element
            row.item.users = res.data.users
            row.toggleDetails()
        },
        async addUserToGroup(groupId, userNetid) {
            if (userNetid === "") {
                return this.showErrorMessage({ message: "Netid can't be empty." })
            }
            await api.groups.addUser(groupId, userNetid)
            await this.fetchGroups()
            this.newUserNetId = ""
            this.showSuccessMessage({ message: "Succesfully added user to group." })
        },
        async removeUserFromGroup(groupId, userNetid) {
            await api.groups.removeUser(groupId, userNetid)
            await this.fetchGroups()
            this.showSuccessMessage({ message: "Succesfully removed user from group." })
        }
    }
}
</script>
