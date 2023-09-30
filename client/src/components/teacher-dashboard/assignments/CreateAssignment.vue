<template>
    <div>
        <b-container>
            <!--Header-->
            <b-row>
                <b-col>
                    <h1 class="mt-5">Create a new assignment</h1>
                    <iframe src="http://localhost/jupyter/index.html" width="100%" height="500px"></iframe>
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
        AssignmentForm,
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
                blockFeedback: true,
                lateSubmissions: true,
                lateSubmissionReviews: true,
                lateReviewEvaluations: true,
                automaticStateProgression: false,
                assignmentType: "document",
                sendNotificationEmails: false,
            },
        }
    },
    methods: {
        async triggerSave() {
            try {
                // Define the origin (usually the URL of your web application)

                // Open the database with the specified origin
                const indexedDB = window.indexedDB
                const request = indexedDB.open("JupyterLite Storage")

                const db = await new Promise((resolve, reject) => {
                    request.onsuccess = (event) => resolve(event.target.result)
                    request.onerror = (event) => reject(event.target.error)
                })
                console.log(db)
                const transaction = db.transaction(["files"], "readonly")
                const objectStore = transaction.objectStore("files")

                const fileKey = "Untitled.ipynb"

                const fileData = await new Promise((resolve, reject) => {
                    const getRequest = objectStore.get(fileKey)
                    getRequest.onsuccess = (event) => resolve(event.target.result)
                    getRequest.onerror = (event) => reject(event.target.error)
                })

                console.log(fileData)
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },

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
                data.callback(error)
            }
        },
    },
}
</script>
