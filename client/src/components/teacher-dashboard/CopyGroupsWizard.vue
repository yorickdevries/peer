<template>
    <b-card header="Copy groups">
        <b-alert class="d-flex justify-content-between flex-wrap pb-0" show variant="warning">
            <p class="mb-1">Important notes regarding the copying of groups of other assignments:</p>
            <ul>
                <li>
                    After copying the groups, the new groups will be visible
                    <span class="font-weight-bold">after you reload the page</span>
                </li>
                <li>
                    Make sure to select the <span class="font-weight-bold">correct</span> assignment to copy groups from
                </li>
            </ul>
        </b-alert>

        <b-form-group label="Select the assignment to copy groups from">
            <b-form-select v-model="assignmentToCopyGroupsFrom" required>
                <b-form-select-option v-for="assignment in assignments" :key="assignment.id" :value="assignment">{{
                    assignment.name
                }}</b-form-select-option>
            </b-form-select>
        </b-form-group>

        <b-form-group label="" class="mb-0">
            <b-button variant="primary" class="mt-3" @click="copyGroups">Copy groups</b-button>
        </b-form-group>
    </b-card>
</template>

<script>
import api from "../../api/api"
import _ from "lodash"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            assignments: [],
            assignmentToCopyGroupsFrom: null
        }
    },
    async created() {
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        const allAssignments = res.data
        this.assignments = _.filter(allAssignments, assignment => {
            return assignment.id !== parseInt(this.$route.params.assignmentId)
        })
    },
    methods: {
        async copyGroups() {
            await api.groups.copy(this.$route.params.assignmentId, this.assignmentToCopyGroupsFrom.id)
            this.showSuccessMessage()
        }
    }
}
</script>
