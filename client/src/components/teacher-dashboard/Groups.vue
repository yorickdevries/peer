<template>
    <div v-if="groups">
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
                    <b-button v-b-modal="`importGroups${assignment.id}`" variant="primary" size="sm" class="mb-3"
                        >Import groups
                    </b-button>

                    <!--Import Group Modal-->
                    <b-modal
                        :id="`importGroups${assignment.id}`"
                        centered
                        hide-header
                        hide-footer
                        class="p-0 m-0"
                        size="lg"
                    >
                        <ImportGroupsWizard :modalId="`importGroups${assignment.id}`"></ImportGroupsWizard>
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
                    <b-button v-b-modal="`copyGroups${assignment.id}`" variant="primary" size="sm"
                        >Copy groups
                    </b-button>
                    <b-modal
                        :id="`copyGroups${assignment.id}`"
                        centered
                        hide-header
                        hide-footer
                        class="p-0 m-0"
                        size="lg"
                    >
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
                        <b-form-input v-model="filter" debounce="1000" placeholder="Type to search" />
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
                <b-button variant="success" v-b-modal="`createGroup${assignment.id}`">Create Group</b-button>
            </b-col>
        </b-row>

        <b-modal :id="`createGroup${assignment.id}`" centered title="Create Group" @ok="createGroup()">
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
                    {{ row.detailsShowing ? "Hide" : "Show" }} Edit Group/Submissions
                </b-button>
                <!--Delete Group-->
                <b-button size="sm" v-b-modal="`deleteGroup${row.item.id}`" class="mr-2" variant="danger">
                    Delete Group
                </b-button>

                <b-modal :id="`deleteGroup${row.item.id}`" centered title="Warning" @ok="deleteGroup(row.item.id)">
                    <div>Are you sure you want to delete this group?</div>
                </b-modal>
            </template>

            <!--Actions-->
            <template v-slot:row-details="row">
                <b-card header="Group Members" class="h-100">
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
                <b-card header="Submissions" class="h-100">
                    <div v-if="row.item.submissions.length > 0">
                        <b-table
                            striped
                            outlined
                            show-empty
                            stacked="md"
                            :items="row.item.submissions"
                            :fields="submissionFields"
                            sort-by="id"
                        >
                            <template v-slot:cell(file)="data">
                                <a :href="submissionFilePath(data.item.id)" target="_blank">
                                    {{ data.item.file.name }}{{ data.item.file.extension }}
                                </a>
                            </template>
                            <template v-slot:cell(date)="data">
                                {{ data.item.createdAt | formatDate }}
                            </template>
                            <!--Actions-->
                            <template v-slot:cell(action)="data">
                                <!--Trigger final /  not final-->
                                <b-button
                                    v-if="!data.item.final"
                                    v-b-modal="`changeSubmissionToFinalModal${data.item.id}`"
                                    :disabled="
                                        !(assignment.state === 'submission' || assignment.state === 'waitingforreview')
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
                                    :disabled="
                                        !(assignment.state === 'submission' || assignment.state === 'waitingforreview')
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
                                    Are you sure you want to make this submission not final anymore? This means the
                                    group will not participate in the reviews.
                                </b-modal>
                            </template>
                        </b-table>
                        Only the final submission will be used for reviewing
                        <br /><br />
                    </div>
                    <b-alert v-else show variant="danger">The group has not yet made a submission</b-alert>

                    <!-- Modal Button -->
                    <b-button
                        v-b-modal="`uploadModal${row.item.id}`"
                        :disabled="!(assignment.state === 'submission' || assignment.state === 'waitingforreview')"
                        variant="primary"
                        @click="resetFile(row.item)"
                        >Upload new Submission</b-button
                    >

                    <!-- Upload Modal-->
                    <b-modal
                        :id="`uploadModal${row.item.id}`"
                        ref="uploadModal"
                        centered
                        hide-footer
                        :title="`Upload Submission for group ${row.item.name}`"
                    >
                        <b-alert show variant="warning"
                            >If the group already uploaded a file, it will not be used for reviewing anymore!
                        </b-alert>
                        Select the assignment version for the submission:
                        <b-form-select
                            v-model="row.item.assignmentVersionId"
                            :options="assignmentVersionOptions"
                        ></b-form-select>
                        <hr />
                        <b-alert show variant="secondary"
                            >Allowed file types: {{ assignment.submissionExtensions }}</b-alert
                        >
                        <b-form-file
                            v-model="row.item.newFile"
                            :accept="assignment.submissionExtensions"
                            placeholder="Choose a file..."
                            required
                            :state="Boolean(row.item.newFile)"
                        />
                        <b-button variant="primary" class="mt-3" @click="submitSubmission(row.item)">Upload</b-button>
                    </b-modal>
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
            groups: null,
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
            submissionFields: [
                { key: "id", label: "ID", sortable: true },
                { key: "assignmentVersionId", label: "Assignment version ID" },
                { key: "file", label: "File" },
                { key: "userNetid", label: "Submitted by" },
                { key: "date", label: "​​​Date" },
                { key: "final", label: "Final" },
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
    computed: {
        assignmentVersionOptions() {
            const options = []
            if (this.assignment) {
                for (const assignmentVersion of this.assignment.versions) {
                    options.push({
                        value: assignmentVersion.id,
                        text: `${assignmentVersion.name} (ID: ${assignmentVersion.id})`
                    })
                }
            }
            return options
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
            // fetch the users
            const res = await api.groups.get(row.item.id)
            // set the users in the row element
            row.item.users = res.data.users

            // fetch the submissions
            const submissions = []
            for (const assignmentVersion of this.assignment.versions) {
                const res2 = await api.assignmentversions.getSubmissions(assignmentVersion.id, row.item.id)
                submissions.push(...res2.data)
            }
            // set the submissions in the row element
            row.item.submissions = submissions
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
        },
        async submitSubmission(rowItem) {
            const file = rowItem.newFile
            const groupId = rowItem.id
            if (!file) {
                this.showErrorMessage({ message: "No file selected" })
                return
            }
            let config = { "Content-Type": "multipart/form-data" }
            // Perform upload.
            await api.submissions.post(groupId, rowItem.assignmentVersionId, file, config)
            this.showSuccessMessage({ message: "Successfully submitted submission." })
            this.resetFile(rowItem)
            await this.fetchGroups()
        },
        submissionFilePath(id) {
            // Get the submission file path.
            return `/api/submissions/${id}/file`
        },
        resetFile(rowItem) {
            rowItem.newFile = null
        },
        async changeSubmissionToFinal(id) {
            await api.submissions.patch(id, true)
            this.showSuccessMessage({ message: "Set submission as final" })
            await this.fetchGroups()
        },
        async changeSubmissionToNotFinal(id) {
            await api.submissions.patch(id, false)
            this.showSuccessMessage({ message: "Set submission as not final" })
            await this.fetchGroups()
        }
    }
}
</script>
