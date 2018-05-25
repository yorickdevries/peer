<template>
    <b-container fluid class="px-0">
        <b-row>

            <!--Assignment Details-->
            <b-col>
                <h5>Assignment Details</h5>
                <span class="font-weight-bold">Description</span>
                <p>
                    {{ assignment.description }}
                </p>
                <span class="font-weight-bold">Peer Review Setup (MOCK INFO)</span>
                <p>
                    You will make the assignment as a <b-badge variant="success ml-1">GROUP</b-badge>
                    <br>
                    You will review the assignment as a <b-badge variant="success ml-1">INDIVIDUAL STUDENT</b-badge>
                </p>
                <span class="font-weight-bold">Download</span>
                <b-button variant="primary w-100" :href="formattedFilePath(assignment.filename)">Download Assignment</b-button>
            </b-col>

            <!--Hand-In Form-->
            <b-col>
                <h5>Hand-In</h5>
                <p>
                    Hand in the assignment here before the due date seen above. Make sure to read the requirements
                    for the file you need to submit!
                </p>
                <b-form-file v-model="file" :state="Boolean(file)" placeholder="Choose a file..."></b-form-file>
                
            </b-col>

        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api"

export default {
    async created() {
        let res = await api.getAssignment(this.$route.params.assignmentId)
        this.assignment = res.data
    },
    data() {
        return {
            file: true,
            items: [],
            course: {
                id: 1,
                name: "ED-3",
                description: null
            },
            assignment: {
                title: null,
                description: null,
                due_date: null,
                publish_date: null,
                id: 1,
                course_id: 1,
                filename: ""
            }
        }
    },
    methods: {
        formattedFilePath(path) {
            if (path.charAt(0) !== '/') {
                return '/' + path
            }
            return path
        }
    }
}
</script>
