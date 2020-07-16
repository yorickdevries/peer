<template>
    <div fluid>
        <!--Display existing groups-->
        <b-row>
            <b-col>
                <b-alert variant="danger" show>Modifying groups should be done with caution!</b-alert>

                <!--Table Options-->
                <b-row>
                    <b-col cols="6" class="mb-3">
                        <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                            <b-input-group>
                                <b-form-input v-model="filter" placeholder="Type to search"></b-form-input>
                                <b-input-group-append>
                                    <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col cols="6">
                        <b-form-group horizontal label="Per page">
                            <b-form-input type="number" v-model="perPage"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>

                <!--Create Group-->
                <b-row>
                    <b-col class="mb-3">
                        <b-button variant="success" v-b-modal.addGroup>Create Group</b-button>
                    </b-col>
                </b-row>

                <b-modal id="addGroup" centered title="Add Group" @ok="createNewGroup">
                    <div>Group name:</div>
                    <b-input v-model="newGroupName"></b-input>
                </b-modal>

                <!--Table-->
                <b-table
                    striped
                    outline
                    show-empty
                    stacked="md"
                    :items="groups"
                    :fields="fields"
                    :current-page="currentPage"
                    :per-page="Number(perPage)"
                    :filter="filter"
                >
                    <!--Actions Toggles-->
                    <template slot="actions" slot-scope="row">
                        <!--Show Details-->
                        <b-button size="sm" @click.stop="showDetails(row)" class="mr-2">
                            {{ row.detailsShowing ? "Hide" : "Show" }} Edit Group
                        </b-button>

                        <!--Delete Group-->
                        <b-button size="sm" @click.stop="deleteGroup(row.item.id)" class="mr-2" variant="danger">
                            Delete Group
                        </b-button>
                    </template>

                    <!--Actions-->
                    <template slot="row-details" slot-scope="row">
                        <b-card>
                            <b-row>
                                <b-col>
                                    <dl>
                                        <!--Edit Group-->
                                        <dt>Edit Group Members</dt>
                                        <dd
                                            v-for="member in row.item.members"
                                            :key="member.user_netid"
                                            class="d-flex mb-2 align-middle"
                                        >
                                            <b-button
                                                variant="danger"
                                                size="sm"
                                                @click="removeGroupMember(row.item.id, member.user_netid)"
                                                >Remove</b-button
                                            >
                                            <div class="align-self-center ml-2">
                                                {{ member.user_netid }}
                                            </div>
                                        </dd>
                                        <!--Add Group-->
                                        <dt>Add Group Member</dt>
                                        <dd class="d-flex">
                                            <b-button
                                                variant="success"
                                                class="mr-2"
                                                size="sm"
                                                @click="addGroupMember(row.item.id, netNetId)"
                                                >Add Group Member</b-button
                                            >
                                            <b-input v-model="netNetId" placeholder="Enter valid NetID here."></b-input>
                                        </dd>
                                    </dl>
                                </b-col>
                            </b-row>
                        </b-card>
                    </template>
                </b-table>

                <!--Pagination-->
                <b-pagination
                    :total-rows="this.groups.length"
                    :per-page="Number(perPage)"
                    v-model="currentPage"
                    class="my-0"
                >
                </b-pagination>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import notifications from "../../mixins/notifications"
import api from "../../api_old"

export default {
    mixins: [notifications],
    data() {
        return {
            groups: [],
            currentPage: 1,
            fields: [
                { key: "id", label: "Group ID", sortable: true },
                { key: "group_name", label: "Group name", sortable: true },
                { key: "actions", label: "Actions" }
            ],
            filter: null,
            perPage: 10,
            newGroupName: "",
            netNetId: ""
        }
    },
    props: ["assignmentId"],
    async created() {
        await this.fetchGroups()
    },
    methods: {
        async fetchGroups() {
            try {
                let res = await api.getAssignmentGroups(this.assignmentId)
                this.groups = res.data
            } catch (e) {
                console.log(e)
            }
        },
        async showDetails(row) {
            row.toggleDetails()
            let res = await api.getUsersGroupById(row.item.id)
            this.$set(row.item, "members", res.data)
        },
        async createNewGroup() {
            if (this.newGroupName === "") return this.showErrorMessage({ message: "Group name can't be empty." })

            try {
                console.log(this.newGroupName)
                await api.client.post(`assignments/${this.assignmentId}/groups`, {
                    group_name: this.newGroupName
                })
                await this.fetchGroups()
                this.showSuccessMessage()
                this.newGroupName = ""
            } catch (e) {
                this.showErrorMessage()
            }
        },
        async deleteGroup(id) {
            try {
                await api.client.delete(`groups/${id}`)
                await this.fetchGroups()
                this.showSuccessMessage()
            } catch (e) {
                this.showErrorMessage({ message: e.response.data.error })
            }
        },
        async removeGroupMember(groupId, memberNetId) {
            try {
                await api.client.delete(`groups/${groupId}/users/${memberNetId}`)
                await this.fetchGroups()
                this.showSuccessMessage()
            } catch (e) {
                this.showErrorMessage()
            }
        },
        async addGroupMember(groupId, memberNetId) {
            try {
                await api.client.post(`groups/${groupId}/users`, {
                    user_netid: memberNetId,
                    assignmentId: this.assignmentId
                })
                await this.fetchGroups()
                this.showSuccessMessage()
                this.netNetId = ""
            } catch (e) {
                this.showErrorMessage({ message: e.response.data.error })
            }
        }
    }
}
</script>
