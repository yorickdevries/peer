<template>
    <b-container>

        <b-row>
            <b-col>
                <BreadcrumbTitle :items="['Assignments']" class="mt-3"/>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card no-body>
                    <b-tabs card>
                        <b-row>
                            <b-col>
                                <!--Active Assignments-->
                                <b-tab title="Active Assignments" active>
                                    <b-card v-for="assignment in activeAssignments" :key="assignment.id" no-body class="mb-3">
                                        <b-card-body>
                                            <h4>{{ assignment.title }}</h4>
                                            <p>{{ assignment.description | truncate(100)}}</p>
                                            <b-button variant="primary" :to="{ name: 'student-dashboard.course.assignment', params: { courseId: assignment.course_id, assignmentId: assignment.id } }">View Assignment</b-button>
                                        </b-card-body>
                                        <b-card-footer class="text-danger">Due</b-card-footer>
                                    </b-card>
                                </b-tab>

                                <!--Closed Assignments-->
                                <b-tab title="Closed Assignments" >
                                    <b-card v-for="assignment in closedAssignments" :key="assignment.id" no-body class="mb-3">
                                        <b-card-body>
                                            <h4>{{ assignment.title | truncate(100)}}</h4>
                                            <p>{{ assignment.description | truncate(100)}}</p>
                                            <b-button variant="primary" :to="{ name: 'student-dashboard.course.assignment', params: { courseId: assignment.course_id, assignmentId: assignment.id } }">View Assignment</b-button>
                                        </b-card-body>
                                        <b-card-footer>Done</b-card-footer>
                                    </b-card>
                                </b-tab>
                            </b-col>

                        </b-row>
                    </b-tabs>
                </b-card>
            </b-col>
        </b-row>

    </b-container>
</template>

<script>
import api from "../../api"
import BreadcrumbTitle from '../BreadcrumbTitle'

export default {
    components: {BreadcrumbTitle},
    data() {
        return {
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
    },
    async created() {
        // Fetch assignments.
        let resAssignment = await api.getCourseAssignments(this.$route.params.courseId)
        this.assignments = resAssignment.data
    },
}

</script>
