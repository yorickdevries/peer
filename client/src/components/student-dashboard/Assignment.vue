<template>
    <b-container>
        <b-row>
            <b-col>
                <BreadcrumbTitle :items="['Assignments', assignment.name]" class="mt-3" />
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-card no-body>
                    <b-row class="px-3 pt-0">
                        <b-col class="p-0 d-flex flex-wrap">
                            <b-button
                                variant="white"
                                active-class="bg-light"
                                class="flex-fill p-0"
                                :to="{ name: 'student-dashboard.course.assignment.information' }"
                            >
                                <div class="text-center border-right border-bottom active py-3">
                                    <div class="lead font-weight-bold">Assignment</div>
                                    <div class="text-muted">Information</div>
                                </div>
                            </b-button>

                            <b-button
                                variant="white"
                                active-class="bg-light"
                                class="flex-fill p-0"
                                :to="{ name: 'student-dashboard.course.assignment.submission' }"
                            >
                                <div class="text-center border-right border-bottom py-3">
                                    <div class="lead font-weight-bold">
                                        Submission
                                        <b-badge variant="success" v-if="isSubmissionActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <div class="text-muted">Due: {{ assignment.dueDate | formatDateCompact }}</div>
                                </div>
                            </b-button>

                            <b-button
                                variant="white"
                                active-class="bg-light"
                                class="flex-fill p-0"
                                :to="{ name: 'student-dashboard.course.assignment.review-list' }"
                                :disabled="!isInOrAfterReviewState"
                            >
                                <div class="text-center border-right border-bottom py-3">
                                    <div class="lead font-weight-bold">
                                        Review
                                        <b-badge variant="success" v-if="isReviewActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <span class="text-muted"
                                        >Due: {{ assignment.reviewDueDate | formatDateCompact }}</span
                                    >
                                </div>
                            </b-button>

                            <b-button
                                variant="white"
                                active-class="bg-light"
                                class="flex-fill p-0"
                                :to="{ name: 'student-dashboard.course.assignment.feedback' }"
                                :disabled="!isInFeedbackState"
                            >
                                <div class="text-center border-right border-bottom py-3">
                                    <div class="lead font-weight-bold ">
                                        Received Feedback
                                        <b-badge variant="success" v-if="isInFeedbackState">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <span class="text-muted"
                                        >Opens after {{ assignment.reviewDueDate | formatDateCompact }}</span
                                    >
                                </div>
                            </b-button>

                            <b-button
                                v-if="assignment.reviewEvaluation"
                                variant="white"
                                active-class="bg-light"
                                class="flex-fill p-0"
                                :to="{ name: 'student-dashboard.course.assignment.review-evaluation' }"
                                :disabled="!isInFeedbackState"
                            >
                                <div class="text-center border-bottom py-3">
                                    <div class="lead font-weight-bold ">
                                        Review Evaluation
                                        <b-badge variant="success" v-if="isEvaluationActive">Open</b-badge>
                                        <b-badge variant="danger" v-else>Closed</b-badge>
                                    </div>
                                    <span class="text-muted"
                                        >Due: {{ assignment.reviewEvaluationDueDate | formatDateCompact }}</span
                                    >
                                </div>
                            </b-button>
                        </b-col>
                    </b-row>

                    <b-card-body>
                        <b-row>
                            <b-col>
                                <router-view></router-view>
                            </b-col>
                        </b-row>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    name: "Assignment",
    components: { BreadcrumbTitle },
    data() {
        return {
            assignment: {}
        }
    },
    computed: {
        isInSubmissionState() {
            return this.assignment.state === "submission"
        },
        isInReviewState() {
            return this.assignment.state === "review"
        },
        isInFeedbackState() {
            return this.assignment.state === "feedback"
        },
        isInOrAfterReviewState() {
            return this.isInReviewState || this.isInFeedbackState
        },
        isSubmissionActive() {
            return (
                this.isInSubmissionState &&
                // either late submission must be enabled or the due date should not have been passed
                (this.assignment.lateSubmissions || new Date() < new Date(this.assignment.dueDate))
            )
        },
        isReviewActive() {
            return (
                this.isInOrAfterReviewState &&
                // either late submissionreviews must be enabled or the due date should not have been passed
                (this.assignment.lateSubmissionReviews || new Date() < new Date(this.assignment.reviewDueDate))
            )
        },
        isEvaluationActive() {
            return (
                this.isInFeedbackState &&
                this.assignment.reviewEvaluation &&
                new Date() < new Date(this.assignment.reviewEvaluationDueDate)
            )
        }
    },
    async created() {
        // Fetch the assignment information.
        const res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data
    }
}
</script>
