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
                                <!--Enrollable-->
                                <b-tab active>
                                    <template slot="title">
                                        Open for enrollment
                                        <b-badge variant="info">{{ enrollableAssignments.length }}</b-badge>
                                    </template>
                                    <p class="text-muted">
                                        Open for enrollment means you can enroll yourself for the assignment. In some
                                        cases, the teacher enrolls you for the assignment(s).
                                    </p>
                                    <span v-if="enrollableAssignments.length === 0"
                                        >There are currently no assignments open for enrollment.</span
                                    >
                                    <b-card v-for="assignment in enrollableAssignments" :key="assignment.id" no-body>
                                        <b-card-body>
                                            <h4>{{ assignment.name }}</h4>
                                            <b-badge variant="secondary" class="ml-2 float-right p-1">
                                                {{ assignment.state.toUpperCase() }}</b-badge
                                            >
                                            <p v-if="assignment.description != null">
                                                {{ assignment.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No assignment description</i></p>
                                            <b-button
                                                variant="outline-primary"
                                                @click="enrollInAssignment(assignment.id)"
                                                >Enroll in Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Submission-->
                                <b-tab>
                                    <template slot="title"
                                        >Ready for submission
                                        <b-badge variant="info">{{ assignmentsInSubmissionState.length }}</b-badge>
                                    </template>
                                    <p class="text-muted">
                                        Ready for submission means that the assignment is open for submitting a solution
                                        to the assignment.
                                    </p>
                                    <span v-if="assignmentsInSubmissionState.length === 0"
                                        >There are currently no assignments ready for submission.</span
                                    >
                                    <b-card
                                        v-for="assignment in assignmentsInSubmissionState"
                                        :key="assignment.id"
                                        no-body
                                    >
                                        <b-card-body>
                                            <h4>{{ assignment.name }}</h4>
                                            <b-badge variant="secondary" class="ml-2 float-right p-1">
                                                {{ assignment.state.toUpperCase() }}</b-badge
                                            >
                                            <p v-if="assignment.description != null">
                                                {{ assignment.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No assignment description</i></p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.courseId,
                                                        assignmentId: assignment.id
                                                    }
                                                }"
                                                >View Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Review-->
                                <b-tab>
                                    <template slot="title"
                                        >Ready for review
                                        <b-badge variant="info">{{
                                            assignmentsInWaitingForReviewOrReviewState.length
                                        }}</b-badge></template
                                    >
                                    <p class="text-muted">
                                        Ready for review means that the assignment is open for reviewing a solution from
                                        other students.
                                    </p>
                                    <span v-if="assignmentsInWaitingForReviewOrReviewState.length === 0"
                                        >There are currently no assignments ready for review.</span
                                    >
                                    <b-card
                                        v-for="assignment in assignmentsInWaitingForReviewOrReviewState"
                                        :key="assignment.id"
                                        no-body
                                    >
                                        <b-card-body>
                                            <b-badge
                                                v-if="isInWaitingForReviewState(assignment)"
                                                class="mb-2"
                                                variant="danger"
                                                >Review opens at:
                                                {{ assignment.reviewPublishDate | formatDate }}</b-badge
                                            >
                                            <h4>{{ assignment.name }}</h4>
                                            <b-badge variant="secondary" class="ml-2 float-right p-1">
                                                {{ assignment.state.toUpperCase() }}</b-badge
                                            >
                                            <p v-if="assignment.description != null">
                                                {{ assignment.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No assignment description</i></p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.courseId,
                                                        assignmentId: assignment.id
                                                    }
                                                }"
                                                >View Assignment</b-button
                                            >
                                        </b-card-body>
                                    </b-card>
                                </b-tab>

                                <!--Feedback-->
                                <b-tab>
                                    <template slot="title"
                                        >Feedback available
                                        <b-badge variant="info">{{
                                            assignmentsInFeedbackState.length
                                        }}</b-badge></template
                                    >
                                    <p class="text-muted">
                                        Ready for feedback means that the feedback is available for the submission you
                                        handed in.
                                    </p>
                                    <span v-if="assignmentsInFeedbackState.length === 0"
                                        >There are currently no assignments for which the feedback is available.</span
                                    >
                                    <b-card
                                        v-for="assignment in assignmentsInFeedbackState"
                                        :key="assignment.id"
                                        no-body
                                    >
                                        <b-card-body>
                                            <h4>{{ assignment.name }}</h4>
                                            <b-badge variant="secondary" class="ml-2 float-right p-1">
                                                {{ assignment.state.toUpperCase() }}</b-badge
                                            >
                                            <p v-if="assignment.description != null">
                                                {{ assignment.description | truncate(200) }}
                                            </p>
                                            <p v-else><i>No assignment description</i></p>
                                            <b-button
                                                variant="primary"
                                                :to="{
                                                    name: 'student-dashboard.course.assignment',
                                                    params: {
                                                        courseId: assignment.courseId,
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
import _ from "lodash"
import BreadcrumbTitle from "../BreadcrumbTitle"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle },
    data() {
        return {
            enrollableAssignments: [],
            enrolledAssignments: [],
            assignments: []
        }
    },
    computed: {
        assignmentsInSubmissionState() {
            return _.filter(this.enrolledAssignments, assignment => {
                return assignment.state === "submission"
            })
        },
        assignmentsInWaitingForReviewOrReviewState() {
            return _.filter(this.enrolledAssignments, assignment => {
                return assignment.state === "watingforreview" || assignment.state === "review"
            })
        },
        assignmentsInFeedbackState() {
            return _.filter(this.enrolledAssignments, assignment => {
                return assignment.state === "feedback"
            })
        }
    },
    async created() {
        await this.fetchAssignments()
    },
    methods: {
        async fetchAssignments() {
            // Fetch assignments.
            // enrollable
            const res1 = await api.courses.getEnrollableAssignments(this.$route.params.courseId)
            this.enrollableAssignments = res1.data
            // enrolled
            const res2 = await api.courses.getEnrolledAssignments(this.$route.params.courseId)
            this.enrolledAssignments = res2.data
        },
        async enrollInAssignment(assignmentId) {
            await api.assignments.enroll(assignmentId)
            this.showSuccessMessage({ message: "Enrolled in assignment." })
            this.fetchAssignments()
        },
        isInWaitingForReviewState(assignment) {
            return assignment.state === "watingforreview"
        }
    }
}
</script>
