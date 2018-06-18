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

                    <b-button variant="primary w-100" :href="assignmentFilePath" target="_blank">Download Assignment
                    </b-button>
                </b-card>
            </b-col>

            <b-col cols="4">
                <!--Group Information-->
                <b-card header="Group Information" no-body>
                    <b-card-body>
                        <p>Assignments are made in groups. The group members you are with for this assignment are displayed here.</p>
                        <dl>
                            <dt>Group ID</dt>
                            <dd>{{ groupInfo.group.group_groupid }}</dd>

                            <dt>Group Members</dt>
                            <dt><ul><li v-for="member in groupInfo.groupmembers" :key="member.user_netid" class="font-weight-light">{{ member.user_netid }}</li></ul></dt>
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
                filename: ""
            },
            groupInfo: {
                group: {
                    group_groupid: null
                },
                groupmembers: []
            }
        }
    },
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        }
    },
    async created() {
        await this.fetchAssignment()
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
        }
    }
}
</script>
