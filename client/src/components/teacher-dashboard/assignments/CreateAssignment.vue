<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Create a new assignment</h1>
                </b-col>
            </b-row>

            <!--Create assignment card-->
            <AssignmentForm @submitted="onSubmit" :assignment="assignment" :edit="false" />
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import AssignmentForm from "./AssignmentForm"

export default {
    mixins: [notifications],
    components: {
        AssignmentForm
    },
    data() {
        return {
            assignment: {
                name: "",
                enrollable: false,
                reviewEvaluation: false,
                publishDay: null,
                publishTime: "23:59",
                dueDay: null,
                dueTime: "23:59",
                reviewPublishDay: null,
                reviewPublishTime: "23:59",
                reviewDueDay: null,
                reviewDueTime: "23:59",
                reviewEvaluationDueDay: null,
                reviewEvaluationDueTime: "23:59",
                description: null,
                file: null,
                externalLink: null,
                submissionExtensions: ".pdf",
                whitelistExtensions: null,
                blockFeedback: true,
                lateSubmissions: true,
                lateSubmissionReviews: true,
                lateReviewEvaluations: true,
                automaticStateProgression: false,
                assignmentType: "document"
            }
        }
    },
    methods: {
        async onSubmit(data) {
            try {
                // call post api
                await api.assignments.post(
                    this.assignment.name,
                    this.$route.params.courseId,
                    this.assignment.enrollable,
                    this.assignment.reviewEvaluation,
                    data.publishDate,
                    data.dueDate,
                    data.reviewPublishDate,
                    data.reviewDueDate,
                    data.reviewEvaluationDueDate,
                    this.assignment.description,
                    this.assignment.externalLink,
                    this.assignment.file,
                    data.submissionExtensions,
                    this.assignment.blockFeedback,
                    this.assignment.lateSubmissions,
                    this.assignment.lateSubmissionReviews,
                    this.assignment.lateReviewEvaluations,
                    this.assignment.automaticStateProgression,
                    this.assignment.assignmentType
                )
                this.showSuccessMessage({ message: "Assignment was successfully created" })
                this.$router.push({
                    name: "teacher-dashboard.assignments",
                    params: { courseId: this.$route.params.courseId }
                })
            } catch (error) {
                data.callback(error)
            }
        }
    }
}
</script>
