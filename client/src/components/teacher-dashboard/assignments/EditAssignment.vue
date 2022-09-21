<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Edit {{ assignment.name }}</h1>
                </b-col>
            </b-row>
            <AssignmentForm @submitted="onSubmit" :assignment="assignment" :edit="true" />
        </b-container>
    </div>
</template>

<script>
import moment from "moment"
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
            assignment: {}
        }
    },
    async created() {
        // Load necessary data
        let res = await api.assignments.get(this.$route.params.assignmentId)
        this.assignment = res.data

        // split day from time
        // publish
        this.assignment.publishDay = this.extractDay(new Date(this.assignment.publishDate))
        this.assignment.publishTime = this.extractTime(new Date(this.assignment.publishDate))
        // due
        this.assignment.dueDay = this.extractDay(new Date(this.assignment.dueDate))
        this.assignment.dueTime = this.extractTime(new Date(this.assignment.dueDate))
        // reviewPublish
        this.assignment.reviewPublishDay = this.extractDay(new Date(this.assignment.reviewPublishDate))
        this.assignment.reviewPublishTime = this.extractTime(new Date(this.assignment.reviewPublishDate))
        // reviewDue
        this.assignment.reviewDueDay = this.extractDay(new Date(this.assignment.reviewDueDate))
        this.assignment.reviewDueTime = this.extractTime(new Date(this.assignment.reviewDueDate))
        // reviewEvaluationDue
        this.assignment.reviewEvaluationDueDay = this.assignment.reviewEvaluationDueDate
            ? this.extractDay(new Date(this.assignment.reviewEvaluationDueDate))
            : null
        this.assignment.reviewEvaluationDueTime = this.assignment.reviewEvaluationDueDate
            ? this.extractTime(new Date(this.assignment.reviewEvaluationDueDate))
            : "23:59"
    },
    methods: {
        extractDay(date) {
            const day = new Date()
            day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
            day.setHours(12)
            day.setMinutes(0)
            day.setSeconds(0)
            day.setMilliseconds(0)
            return day
        },
        extractTime(date) {
            return moment(new Date(date)).format("HH:mm")
        },
        async onSubmit(data) {
            try {
                // call patch api
                await api.assignments.patch(
                    this.assignment.id,
                    this.assignment.name,
                    this.assignment.enrollable,
                    this.assignment.reviewEvaluation,
                    data.publishDate,
                    data.dueDate,
                    data.reviewPublishDate,
                    data.reviewDueDate,
                    data.reviewEvaluationDueDate,
                    this.assignment.description,
                    this.assignment.externalLink,
                    data.file,
                    data.submissionExtensions,
                    this.assignment.blockFeedback,
                    this.assignment.lateSubmissions,
                    this.assignment.lateSubmissionReviews,
                    this.assignment.lateReviewEvaluations,
                    this.assignment.automaticStateProgression,
                    this.assignment.assignmentType
                )
                this.showSuccessMessage({ message: "Updated assignment successfully" })
                // Redirect to updated assignment
                this.$router.push({
                    name: "teacher-dashboard.assignments.assignment",
                    params: { courseId: this.$route.params.courseId, assignmentId: this.assignment.id }
                })
            } catch (error) {
                data.callback(error)
            }
        }
    }
}
</script>
