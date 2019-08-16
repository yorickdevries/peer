<template>
    <b-card header="Copy groups">
        <b-alert class="d-flex justify-content-between flex-wrap pb-0" show variant="primary">
            <p>Make sure to select the correct assignment to copy groups from</p>
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
                .filter(x => x.id != this.assignmentId)
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
                    this.showSuccessMessage()
                } catch (e) {
                    this.showErrorMessage({message: e.response.data.error})
                }
            },
        }

    }
</script>