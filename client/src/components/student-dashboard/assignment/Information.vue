<template>
    <b-container fluid class="p-0">
        <b-row>
            <b-col cols="8">

                <!--Assignment Details-->
                <b-card header="Assignment Details" class="h-100">
                    <span class="font-weight-bold">Description</span>
                    <p>{{ assignment.description }}</p>

                    <span class="font-weight-bold">Submission Due Date</span>
                    <p>At this date the submission for the assignment needs to be submitted in the submission tab.<br/>{{ assignment.due_date | formatDate}}</p>

                    <span class="font-weight-bold">Review Due Date</span>
                    <p>At this date the submission for the assignment needs to be submitted in the submission tab.<br/>{{ assignment.review_due_date | formatDate }}</p>

                    <b-button variant="primary w-100" v-if="assignment.filename" :href="assignmentFilePath" target="_blank">Download Assignment
                    </b-button>

                    <!--<p class="text-muted" v-else>The teacher did not upload an assignment file for this assignment.</p>-->

                    <b-button variant="primary w-100" v-if="assignment.external_assignment_link" :href="assignment.external_assignment_link" target="_blank">Go to Assignment (redirect)
                    </b-button>

                </b-card>
            </b-col>

            <b-col cols="4" v-if="assignment.one_person_groups === true">
                <!--Individual Information-->
                <b-card header="Individual Information" no-body>
                    <b-card-body>
                        <p>This assignment is made individually.</p>
                        <dl>
                            <dt>Individual ID</dt>
                            <dd>{{ groupInfo.group.group_groupid }}</dd>

                            <dt>Name</dt>
                            <dd>{{ groupName }}</dd>

                            <dt>Latest Submission</dt>
                            <dd>
                                <div>Download the latest submission you have submitted here.</div>
                                <template v-if="submission.file_path">
                                    <a :href="submissionFilePath" target="_blank">{{ submission.file_path }}</a>
                                </template>
                                <template v-else>
                                    <i>No submission done yet.</i>
                                </template>
                            </dd>
                        </dl>
                    </b-card-body>
                </b-card>
            </b-col>

            <b-col cols="4" v-if="assignment.one_person_groups !== true">
                <!--Group Information-->
                <b-card header="Group Information" no-body>
                    <b-card-body>
                        <p>This assignment is made in a group. The group members you are with for this assignment are displayed here. As a group you share the same submission.</p>
                        <dl>
                            <dt>Group ID</dt>
                            <dd>{{ groupInfo.group.group_groupid }}</dd>

                            <dt>Group Name</dt>
                            <dd>{{ groupName }}</dd>

                            <dt>Group Members</dt>
                            <dt><ul><li v-for="member in groupInfo.groupmembers" :key="member.user_netid" class="font-weight-light">{{ member.user_netid }}</li></ul></dt>

                            <dt>Latest Submission</dt>
                            <dd>
                                <div>Download the latest submission you have submitted with the group here.</div>
                                <template v-if="submission.file_path">
                                    <a :href="submissionFilePath" target="_blank">{{ submission.file_path }}</a>
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
    import api from "../../../api"

    export default {
        data() {
            return {
                assignment: {
                    title: null,
                    description: null,
                    due_date: null,
                    publish_date: null,
                    review_due_date: null,
                    id: null,
                    course_id: null,
                    filename: "",
                    one_person_groups: null,
                    external_assignment_link: null
                },
                groupInfo: {
                    group: {
                        group_groupid: null
                    },
                    groupmembers: []
                },
                groupName: "",
                submission: {
                    user_netid: null,
                    assignment_id: null,
                    file_path: null,
                    date: null,
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
            },
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
                let res = await api.getGroupMembersOfAssignment(this.$route.params.assignmentId)
                this.groupInfo = res.data

                // Fetch group name.
                let nameRes = await api.getGroupInfo(this.groupInfo.group.group_groupid)
                this.groupName = nameRes.data.group_name
            },
            async fetchSubmission() {
                // Fetch the submission.
                try {
                    let res = await api.getAssignmentLatestSubmission(this.assignment.id)
                    this.submission = res.data
                } catch (e) {
                    this.onSubmissionReset()
                }

            },
            onSubmissionReset() {
                this.submission =  {
                    user_netid: null,
                    assignment_id: null,
                    file_path: null
                }
            }
        }
    }
</script>
