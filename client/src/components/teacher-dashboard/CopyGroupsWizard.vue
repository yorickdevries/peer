<template>
    <b-card header="Copy groups">
        <b-alert class="d-flex justify-content-between flex-wrap pb-0" show variant="warning">
            <p>Important to note with copying groups from another assignment:</p>
            <ul>
                <li>After copying the groups, the new groups will be visible <span class="font-weight-bold">after you reload the page</span></li>
                <li>Make sure to select the <span class="font-weight-bold">correct</span> assignment to copy groups from</li>
            </ul>
        </b-alert>

        <b-form-group label="Select the assignment to copy groups from">
            <b-form-select :options="assignments" v-model="assignmentToCopy" required></b-form-select>
        </b-form-group>

        <b-form-group label="" class="mb-0">
            <b-button   variant="primary"
                        class="mt-3"
                        @click="copyGroups">Copy groups</b-button>
        </b-form-group>
    </b-card>
</template>

<script>
    import api from "../../api"
    import notifications from '../../mixins/notifications'

    export default {
        mixins: [notifications],
        props: ['assignmentId', 'courseId'],
        async created() {
            const assignmentsRes = (await api.getCourseAssignments(this.courseId)).data
            this.assignments = assignmentsRes
                .filter(x => x.id !== this.assignmentId)
                .map(x => { return { value: x.id, text: x.title }})
        },
        data() {
            return {
                assignments: [],
                assignmentToCopy: null,
            }
        },
        methods: {
            async copyGroups() {
                // Send files to server
                try {
                    await api.client.post(`/assignments/${this.assignmentToCopy}/copygroups`, {
                        target_assignment_id: this.assignmentId
                    })
                    this.showSuccessMessage({ message: "Copying succesful. Make sure to reload the page." })
                } catch (e) {
                    this.showErrorMessage()
                }
            },
        }

    }
</script>