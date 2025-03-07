<template>
    <b-container fluid class="p-0">
        <b-row>
            <b-col sm="7" class="mb-3">
                <!--Assignment Details-->
                <b-card header="Assignment Details" class="h-100">
                    <span class="font-weight-bold">Description</span>
                    <p>{{ assignment.description }}</p>
                    <span class="font-weight-bold">Submission Due Date</span>
                    <p>
                        Before this date you need to submit your assignment in the 'Submit' tab:<br />
                        {{ assignment.dueDate | formatDate }}
                    </p>
                    <span class="font-weight-bold">Feedback Due Date</span>
                    <p>
                        Before this date you need to submit your feedback in the 'Give Feedback' tab:<br />
                        {{ assignment.reviewDueDate | formatDate }}
                    </p>
                    <span class="font-weight-bold" v-if="assignment.reviewEvaluation">Evaluation Due Date</span>
                    <p v-if="assignment.reviewEvaluation">
                        Before this date you need to submit your evaluation of received feedback in the 'Give
                        Evaluation' tab:<br />
                        {{ assignment.reviewEvaluationDueDate | formatDate }}
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
            <b-col sm="5" class="mb-3">
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
                            <b-table
                                striped
                                outlined
                                show-empty
                                stacked="sm"
                                responsive
                                :items="group.users"
                                :fields="userFields"
                            >
                            </b-table>

                            <dt>Final Submission</dt>
                            <dd>
                                <div>Download the final submission of the group here.</div>
                                <template v-if="finalSubmission">
                                    <a :href="submissionFilePath" target="_blank">
                                        {{ finalSubmission.file.name }}{{ finalSubmission.file.extension }}
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
            finalSubmission: null,
            userFields: [
                { key: "displayName", label: "Name" },
                { key: "netid", label: "NetID" },
                { key: "email", label: "​​​Email" },
            ],
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        },
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.finalSubmission.id}/file`
        },
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchGroup()
        await this.fetchFinalSubmission()
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
        async fetchFinalSubmission() {
            // Fetch the submission.
            const res = await api.assignments.getFinalSubmission(this.$route.params.assignmentId, this.group.id)
            this.finalSubmission = res.data
        },
    },
}
</script>
