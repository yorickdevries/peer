<template>
    <div v-if="assignmentVersions">
        <b-alert show>Assignment versions can only be created while the assignment is not published yet</b-alert>
        <b-row v-if="assignment.state === 'unpublished'">
            <b-col>
                <!--Default-->
                <template v-if="assignmentVersions.length === 0">
                    <dt>Create default assignment version</dt>
                    <dd>
                        Use this button if you do not need custom review distribution strategies with multiple
                        assignment versions
                    </dd>
                    <b-button v-b-modal="`defaultAssignmentVersion${assignment.id}`" variant="primary" class="mb-3"
                        >Create Default Assignment Version
                    </b-button>
                    <!--Default Modal-->
                    <b-modal
                        :id="`defaultAssignmentVersion${assignment.id}`"
                        centered
                        hide-header
                        hide-footer
                        class="p-0 m-0"
                        size="lg"
                    >
                        <CreateDefaultAssignmentVersionWizard @assignmentVersionChanged="fetchData" />
                    </b-modal>
                </template>
            </b-col>
            <b-col>
                <!--Custom-->
                <template>
                    <dt>Create custom assignment version</dt>
                    <dd>
                        Use this button if you need custom review distribution strategies with multiple assignment
                        versions
                    </dd>
                    <b-button v-b-modal="`customAssignmentVersion${assignment.id}`" variant="primary" class="mb-3"
                        >Create Custom Assignment Version
                    </b-button>
                    <!--Custom Modal-->
                    <b-modal
                        :id="`customAssignmentVersion${assignment.id}`"
                        centered
                        hide-header
                        hide-footer
                        class="p-0 m-0"
                        size="lg"
                    >
                        <CreateCustomAssignmentVersionWizard @assignmentVersionChanged="fetchData" />
                    </b-modal>
                </template>
            </b-col>
        </b-row>
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

        <!--Table-->
        <b-table
            striped
            outlined
            show-empty
            stacked="md"
            :items="assignmentVersions"
            :fields="assignmentVersionFields"
            :current-page="currentPage"
            :per-page="Number(perPage)"
            :filter="filter"
        >
            <!--AssignmentVersions to Review-->
            <template v-slot:cell(versionsToReview)="row">
                <ul v-if="row.item.versionsToReview.length > 0">
                    <li v-for="item in row.item.versionsToReview" :key="item.id">
                        {{ item.name }} (ID: {{ item.id }})
                    </li>
                </ul>
                <div v-else>None</div>
            </template>
            <!--Actions-->
            <template v-slot:cell(actions)="row">
                <!--Edit assignmentVersion-->
                <b-button v-b-modal="`editAssignmentVersion${row.item.id}`" variant="primary" class="mb-3"
                    >Edit Assignment Version
                </b-button>
                <!--Custom Modal-->
                <b-modal
                    :id="`editAssignmentVersion${row.item.id}`"
                    centered
                    hide-header
                    hide-footer
                    class="p-0 m-0"
                    size="lg"
                >
                    <EditAssignmentVersionWizard
                        :assignmentVersionId="row.item.id"
                        @assignmentVersionChanged="fetchData"
                    />
                </b-modal>
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination
            :total-rows="this.assignmentVersions.length"
            :per-page="Number(perPage)"
            v-model="currentPage"
            class="my-0"
        />
    </div>
</template>

<script>
import api from "../../../api/api"
import CreateDefaultAssignmentVersionWizard from "./CreateDefaultAssignmentVersionWizard"
import CreateCustomAssignmentVersionWizard from "./CreateCustomAssignmentVersionWizard"
import EditAssignmentVersionWizard from "./EditAssignmentVersionWizard"

export default {
    components: {
        CreateDefaultAssignmentVersionWizard,
        CreateCustomAssignmentVersionWizard,
        EditAssignmentVersionWizard
    },
    data() {
        return {
            assignment: null,
            assignmentVersions: null,
            // for navigation
            assignmentVersionFields: [
                { key: "id", label: "ID", sortable: true },
                { key: "name", label: "Name" },
                { key: "reviewsPerUserPerAssignmentVersionToReview", label: "Reviews per user per version to review" },
                { key: "versionsToReview", label: "Versions to review" },
                { key: "selfReview", label: "Self review" },
                { key: "actions", label: "Actions" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            // force rerender
            this.assignment = null
            this.assignmentVersions = null
            await this.fetchAssignment()
            await this.fetchAssignmentVersions()
        },
        async fetchAssignment() {
            let res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchAssignmentVersions() {
            const versions = []
            for (const version of this.assignment.versions) {
                const res = await api.assignmentversions.get(version.id)
                versions.push(res.data)
            }
            this.assignmentVersions = versions
        }
    }
}
</script>
