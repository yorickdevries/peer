<template>
    <b-container fluid class="p-0">
        <b-row>
            <b-col cols="7">
                <!--Assignment Details-->
                <b-card header="Assignment Details" class="h-100">
                    <span class="font-weight-bold">Description</span>
                    <p>{{ assignment.description }}</p>
                    <span class="font-weight-bold">Submission Due Date</span>
                    <p>
                        At this date the submission for the assignment needs to be submitted in the submission tab:<br />{{
                            assignment.dueDate | formatDate
                        }}
                    </p>
                    <span class="font-weight-bold">Review Due Date</span>
                    <p>
                        At this date the review for the assignment needs to be submitted in the review tab:<br />{{
                            assignment.reviewDueDate | formatDate
                        }}
                    </p>
                    <b-button variant="primary w-100" v-if="assignment.file" :href="assignmentFilePath" target="_blank"
                        >Download Assignment
                    </b-button>
                    <br /><br />
                    <b-button
                        variant="primary w-100"
                        v-if="assignment.externalLink"
                        :href="'//' + assignment.externalLink"
                        target="_blank"
                        >Go to Assignment (redirect)
                    </b-button>
                </b-card>
            </b-col>
            <b-col cols="5">
                <!--Group Information-->
                <b-card header="Group Information" no-body>
                    <b-card-body>
                        <p>
                            This assignment is made in a group. The group members you are with for this assignment are
                            displayed here. As a group you share the same submission.
                        </p>
                        <dl>
                            <dt>Group ID</dt>
                            <dd>{{ group.id }}</dd>

                            <dt>Group Name</dt>
                            <dd>{{ group.name }}</dd>

                            <dt>Group Members</dt>
                            <b-table striped outlined show-empty stacked="md" :items="group.users" :fields="userFields">
                            </b-table>

                            <dt>Latest Submission</dt>
                            <dd>
                                <div>Download the latest submission you have submitted with the group here.</div>
                                <template v-if="latestSubmission">
                                    <a :href="submissionFilePath" target="_blank">
                                        {{ latestSubmission.file.name }}{{ latestSubmission.file.extension }}
                                    </a>
                                </template>
                                <template v-else>
                                    <i>No submission done yet.</i>
                                </template>
                            </dd>
                        </dl>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api/api"

export default {
    data() {
        return {
            assignment: {},
            group: {},
            latestSubmission: null,
            userFields: [
                { key: "displayName", label: "Name" },
                { key: "netid", label: "NetID" },
                { key: "email", label: "​​​Email" }
            ]
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        },
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.latestSubmission.id}/file`
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchGroup()
        await this.fetchLatestSubmission()
    },
    methods: {
        async fetchAssignment() {
            // Fetch the assignment information.
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchLatestSubmission() {
            // Fetch the submission.
            const res = await api.assignments.getFinalSubmission(this.$route.params.assignmentId, this.group.id)
            this.latestSubmission = res.data
        }
    }
}
</script>
