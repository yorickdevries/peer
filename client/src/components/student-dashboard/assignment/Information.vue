<template>
    <b-container fluid class="p-0">
        <b-row>
            <b-col cols="8">
                <!--Assignment Details-->
                <b-card header="Assignment Details" class="h-100">
                    <span class="font-weight-bold">Description</span>
                    <p>{{ assignment.description }}</p>

                    <span class="font-weight-bold">Submission Due Date</span>
                    <p>
                        At this date the submission for the assignment needs to be submitted in the submission tab.<br />{{
                            assignment.dueDate | formatDate
                        }}
                    </p>

                    <span class="font-weight-bold">Review Due Date</span>
                    <p>
                        At this date the submission for the assignment needs to be submitted in the submission tab.<br />{{
                            assignment.reviewDueDate | formatDate
                        }}
                    </p>

                    <b-button variant="primary w-100" v-if="assignment.file" :href="assignmentFilePath" target="_blank"
                        >Download Assignment
                    </b-button>

                    <b-button
                        variant="primary w-100"
                        v-if="assignment.externalLink != null"
                        :href="assignment.externalLink"
                        target="_blank"
                        >Go to Assignment (redirect)
                    </b-button>
                </b-card>
            </b-col>

            <b-col cols="4" v-if="groupInfo.users.length === 1">
                <!--Individual Information-->
                <b-card header="Individual Information" no-body>
                    <b-card-body>
                        <p>This assignment is made individually.</p>
                        <dl>
                            <dt>Individual ID</dt>
                            <dd>{{ groupInfo.id }}</dd>

                            <dt>Name</dt>
                            <dd>{{ groupInfo.name }}</dd>

                            <dt>Latest Submission</dt>
                            <dd>
                                <div>Download the latest submission you have submitted here.</div>
                                <template v-if="submission.file">
                                    <a :href="submissionFilePath" target="_blank">{{ submission.file }}</a>
                                </template>
                                <template v-else>
                                    <i>No submission done yet.</i>
                                </template>
                            </dd>
                        </dl>
                    </b-card-body>
                </b-card>
            </b-col>

            <b-col cols="4" v-if="groupInfo.users.length > 1">
                <!--Group Information-->
                <b-card header="Group Information" no-body>
                    <b-card-body>
                        <p>
                            This assignment is made in a group. The group members you are with for this assignment are
                            displayed here. As a group you share the same submission.
                        </p>
                        <dl>
                            <dt>Group ID</dt>
                            <dd>{{ groupInfo.id }}</dd>

                            <dt>Group Name</dt>
                            <dd>{{ groupInfo.name }}</dd>

                            <dt>Group Members</dt>
                            <dt>
                                <ul>
                                    <li v-for="member in groupInfo.users" :key="member.netid" class="font-weight-light">
                                        {{ member.displayName }}
                                    </li>
                                </ul>
                            </dt>

                            <dt>Latest Submission</dt>
                            <dd>
                                <div>Download the latest submission you have submitted with the group here.</div>
                                <template v-if="submission.file">
                                    <a :href="submissionFilePath" target="_blank">{{ submission.file }}</a>
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
            assignment: {
                name: null,
                description: null,
                dueDate: null,
                publishDate: null,
                reviewDueDate: null,
                id: null,
                courseId: null,
                file: "",
                reviewsPerUser: null,
                externalLink: null
            },
            groupInfo: {
                name: "",
                id: null,
                users: []
            },
            submission: {
                netid: null,
                assignmentId: null,
                file: null
            }
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        },
        submissionFilePath() {
            // Get the submission file path.
            return `/api/submissions/${this.submission.id}/file`
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchSubmission()
        await this.fetchGroupInformation()
    },
    methods: {
        async fetchAssignment() {
            // Fetch the assignment.
            let res = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroupInformation() {
            // Fetch the group information.
            let res = await api.getGroupAsStudent(this.$route.params.assignmentId)
            this.groupInfo = res.data
        },
        async fetchSubmission() {
            // Fetch the submission.
            try {
                let res = await api.getLatestSubmissionAsStudent(this.assignment.id)
                this.submission = res.data
            } catch (e) {
                this.onSubmissionReset()
            }
        },
        onSubmissionReset() {
            this.submission = {
                userNetid: null,
                assignmentId: null,
                file: null
            }
        }
    }
}
</script>
