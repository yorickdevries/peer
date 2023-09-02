<template>
    <Wizard :assignment="assignment"></Wizard>
</template>

<script>
import Wizard from "@/components/teacher-dashboard/wizard/Wizard.vue"

export default {
    components: { Wizard },
    data() {
        return {
            assignment: {
                name: "",
                enrollable: false,
                reviewEvaluation: true,
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
                blockFeedback: false,
                lateSubmissions: false,
                lateSubmissionReviews: false,
                lateReviewEvaluations: false,
                automaticStateProgression: false,
                assignmentType: "document",
                sendNotificationEmails: false,
            },
        }
    },
}
</script>
