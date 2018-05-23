<template>
    <b-container>

        <b-row>
            <b-col>
                <b-breadcrumb :items="items" class="mt-3"/>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-tabs no-fade>
                    <b-row>
                        <b-col>
                            <!--Active Assignments-->
                            <b-tab title="Active Assignments" active>
                                <b-card v-for="assignment in activeAssignments" :key="assignment.id" no-body class="mt-3">
                                    <b-card-body>
                                        <h4>{{ assignment.title}}</h4>
                                        <p>{{ assignment.description}}</p>
                                        <b-button variant="primary" :to="{ name: 'student-dashboard.assignment', params: { id: assignment.id } }">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer class="text-danger">Peer review due in 2 days</b-card-footer>
                                </b-card>
                            </b-tab>

                            <!--Closed Assignments-->
                            <b-tab title="Closed Assignments" >
                                <b-card v-for="assignment in closedAssignments" :key="assignment.id" no-body class="mt-3">
                                    <b-card-body>
                                        <h4>{{ assignment.title}}</h4>
                                        <p>{{ assignment.description}}</p>
                                        <b-button variant="primary" :to="{ name: 'student-dashboard.assignment', params: { id: assignment.id } }">View Assignment</b-button>
                                    </b-card-body>
                                    <b-card-footer>Done</b-card-footer>
                                </b-card>
                            </b-tab>
                        </b-col>

                    </b-row>
                </b-tabs>

            </b-col>
        </b-row>

    </b-container>
</template>

<script>
import api from "../../api"

export default {
    async created() {
        let resAssignment = await api.getCourseAssignments(this.$route.params.id)
        this.assignments = resAssignment.data
    },
    data() {
        return {
            items: [
                {
                    text: 'Assignments',
                    active: true
                }
            ],
            assignments: []
        }
    },
    computed: {
        activeAssignments() {
            let now = new Date()
            return this.assignments.filter(assignment => new Date(assignment.due_date) > now)
        },
        closedAssignments() {
            let now = new Date()
            return this.assignments.filter(assignment => new Date(assignment.due_date) < now)

        }
    }
}

</script>
