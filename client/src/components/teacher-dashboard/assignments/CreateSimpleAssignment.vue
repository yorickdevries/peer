<template>
    <Wizard :assignment="assignment" @submitted="onSubmit"></Wizard>
</template>

<script>
import Wizard from "@/components/teacher-dashboard/wizard/Wizard.vue"
import api from "@/api/api"
import notifications from "@/mixins/notifications"

export default {
    components: { Wizard },
    mixins: [notifications],
    data() {
        return {
            assignment: {
                name: "",
                enrollable: false,
                reviewEvaluation: true,
                publishDay: new Date(),
                publishTime: "23:59",
                dueDay: new Date(),
                dueTime: "23:59",
                reviewPublishDay: new Date(),
                reviewPublishTime: "23:59",
                reviewDueDay: new Date(),
                reviewDueTime: "23:59",
                reviewEvaluationDueDay: new Date(),
                reviewEvaluationDueTime: "23:59",
                description: null,
                file: null,
                externalLink: null,
                submissionExtensions: ".*",
                blockFeedback: false,
                lateSubmissions: false,
                lateSubmissionReviews: false,
                lateReviewEvaluations: false,
                automaticStateProgression: true,
                assignmentType: "document",
                sendNotificationEmails: false,
            },
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
                    this.assignment.assignmentType,
                    this.assignment.sendNotificationEmails
                )
                this.showSuccessMessage({ message: "Assignment was successfully created" })
                this.$router.push({
                    name: "teacher-dashboard.assignments",
                    params: { courseId: this.$route.params.courseId },
                })
            } catch (error) {
                this.showSuccessMessage({ message: `${error}` })
                data.callback(error)
            }
        },
    },
}
</script>
