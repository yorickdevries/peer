<template>
    <b-container>
        <b-row>
            <b-col>
                <BreadcrumbTitle :items="['Assignments']" class="mt-3" />
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card no-body>
                    <b-tabs card fill>
                        <b-row>
                            <b-col>
                                <!--Enrollable Assignments (Single User)-->
                                <b-tab active :title-link-class="{}">
                                    <template slot="title">
                                        Open for enrollment
                                        <b-badge v-if="enrollableAssignments" variant="info">{{
                                            enrollableAssignments.length
                                        }}</b-badge>
                                    </template>
                                    <p class="text-muted">
                                        Open for enrollment means you can enroll yourself for the assignment. In some
                                        cases, the teacher enrolls you for the assignment(s).
                                    </p>
                                    <span v-if="enrollableAssignments.length === 0"
                                        >There are currently no assignments open for enrollment.</span
                                    >
                                    <b-card
                                        v-for="(assignment, index) in enrollableAssignments"
                                        :key="assignment.id"
                                        no-body
                                        :class="{ 'mb-3': index !== enrollableAssignments.length - 1 }"
                                    >
                                        <b-card-body>
                                            <h4>{{ assignment.title | truncate(100) }}</h4>
                                            <p>{{ assignment.description | truncate(100) }}</p>
                                            <b-button
                                                variant="outline-primary"
                                                @click="enrollInAssignment(assignment.id)"
                                                >Enroll in Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Active Assignments-->
                                <b-tab :title-link-class="{}">
                                    <template slot="title"
                                        >Ready for submission
                                        <b-badge v-if="activeAssignments" variant="info">{{
                                            activeAssignments.length
                                        }}</b-badge></template
                                    >
                                    <p class="text-muted">
                                        Ready for submission means that the assignment is open for submitting a solution
                                        to the assignment.
                                    </p>
                                    <span v-if="activeAssignments.length === 0"
                                        >There are currently no assignments ready for submission.</span
                                    >
                                    <b-card
                                        v-for="(assignment, index) in activeAssignments"
                                        :key="assignment.id"
                                        no-body
                                        :class="{ 'mb-3': index !== activeAssignments.length - 1 }"
                                    >
                                        <b-card-body>
                                            <h4>{{ assignment.title }}</h4>
                                            <p>{{ assignment.description | truncate(100) }}</p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.course_id,
                                                        assignmentId: assignment.id
                                                    }
                                                }"
                                                >View Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Review Assignments-->
                                <b-tab :title-link-class="{}">
                                    <template slot="title"
                                        >Ready for review
                                        <b-badge v-if="readyForSubmissionAssignments" variant="info">{{
                                            readyForSubmissionAssignments.length
                                        }}</b-badge></template
                                    >
                                    <p class="text-muted">
                                        Ready for review means that the assignment is open for reviewing a solution from
                                        other students.
                                    </p>
                                    <span v-if="readyForSubmissionAssignments.length === 0"
                                        >There are currently no assignments ready for review.</span
                                    >
                                    <b-card
                                        v-for="(assignment, index) in readyForSubmissionAssignments"
                                        :key="assignment.id"
                                        no-body
                                        :class="{ 'mb-3': index !== readyForSubmissionAssignments.length - 1 }"
                                    >
                                        <b-card-body>
                                            <b-badge
                                                v-if="assignmentIsBetweenHandInDueAndReviewStart(assignment)"
                                                class="mb-2"
                                                variant="danger"
                                                >Review opens at:
                                                {{ assignment.review_publish_date | formatDate }}</b-badge
                                            >
                                            <h4>{{ assignment.title }}</h4>
                                            <p>{{ assignment.description | truncate(100) }}</p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.course_id,
                                                        assignmentId: assignment.id
                                                    }
                                                }"
                                                >View Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Closed Assignments-->
                                <b-tab :title-link-class="{}">
                                    <template slot="title"
                                        >Feedback available
                                        <b-badge v-if="closedAssignments" variant="info">{{
                                            closedAssignments.length
                                        }}</b-badge></template
                                    >
                                    <p class="text-muted">
                                        Ready for feedback means that the feedback is available for the submission you
                                        handed in.
                                    </p>
                                    <span v-if="closedAssignments.length === 0"
                                        >There are currently no assignments for which the feedback is available.</span
                                    >
                                    <b-card
                                        v-for="(assignment, index) in closedAssignments"
                                        :key="assignment.id"
                                        no-body
                                        :class="{ 'mb-3': index !== closedAssignments.length - 1 }"
                                    >
                                        <b-card-body>
                                            <h4>{{ assignment.title | truncate(100) }}</h4>
                                            <p>{{ assignment.description | truncate(100) }}</p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.course_id,
                                                        assignmentId: assignment.id
                                                    }
                                                }"
                                                >View Assignment</b-button
                                            >
                                        </b-card-body>
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
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"
import notifications from "../../mixins/notifications"

// Reason for :title-link-class="{ }" on b-tab.
// https://github.com/bootstrap-vue/bootstrap-vue/issues/2148

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle },
    data() {
        return {
            assignments: [],
            enrollableAssignments: []
        }
    },
    computed: {
        activeAssignments() {
            let now = new Date()
            return this.assignments.filter(
                assignment => now > new Date(assignment.publish_date) && now < new Date(assignment.due_date)
            )
        },
        readyForSubmissionAssignments() {
            let now = new Date()
            return this.assignments.filter(
                assignment => now > new Date(assignment.due_date) && now < new Date(assignment.review_due_date)
            )
        },
        closedAssignments() {
            let now = new Date()
            return this.assignments.filter(assignment => now > new Date(assignment.review_due_date))
        }
    },
    async created() {
        await this.fetch()
    },
    methods: {
        async enrollInAssignment(assignmentId) {
            try {
                await api.enrollInAssignment(assignmentId)
                await this.fetch()
                this.showSuccessMessage({ message: "Enrolled in course." })
            } catch (e) {
                this.showErrorMessage()
                console.log(e)
            }
        },
        async fetch() {
            // Fetch assignments.
            let resAssignment = await api.getEnrolledAssignmentsAsStudent(this.$route.params.courseId)
            this.assignments = resAssignment.data

            // Fetch not yet enrolled assignments.
            try {
                let enrollableAssignments = await api.getEnrollableAssignmentsAsStudent(this.$route.params.courseId)
                this.enrollableAssignments = enrollableAssignments.data
            } catch (e) {
                this.showErrorMessage({ message: "Could not load assignments that you are not yet enrolled in." })
            }
        },
        assignmentIsBetweenHandInDueAndReviewStart(assignment) {
            let now = new Date()
            return now > new Date(assignment.due_date) && now < new Date(assignment.review_publish_date)
        }
    }
}
</script>
