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
                <span class="font-weight-bold">Peer Review Setup</span>
                <p>
                    You will make the assignment as a <b-badge variant="success ml-1">GROUP</b-badge>
                    <br>
                    You will review the assignment as a <b-badge variant="success ml-1">INDIVIDUAL STUDENT</b-badge>
                </p>
                <span class="font-weight-bold">Download</span>
                <b-button variant="primary w-100">Download Assignment</b-button>
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
export default {
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
                title: "Assignment 1",
                description: "Example assignment number one",
                due_date: "2018-05-01T20:30:00.000Z",
                publish_date: "2018-04-01T20:30:00.000Z",
                id: 1,
                course_id: 1
            }
        }
    },
}
</script>
