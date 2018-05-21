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

        let resCourse = await api.getCourse(this.assignments[0].course_id)
        this.course = resCourse.data[0]

        this.items = [
            {
                text: this.course.name,
                active: true
            },
            {
                text: 'Assignments',
                active: true
            }]
    },
    data() {
        return {
            items: [],
            assignments: [],
            course: {
                name: null,
                description: null
            }
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
