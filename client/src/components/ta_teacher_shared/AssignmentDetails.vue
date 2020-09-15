<template>
    <b-card header="Details">
        <dl class="mb-0">
            <dt>Description</dt>
            <dd>{{ assignment.description }}</dd>

            <dt>Enrollable</dt>
            <dd>{{ assignment.enrollable }}</dd>

            <dt>Publish date and time</dt>
            <dd>{{ assignment.publishDate | formatDate }}</dd>

            <dt>Assignment due date and time</dt>
            <dd>{{ assignment.dueDate | formatDate }}</dd>

            <dt>Allow late submissions</dt>
            <dd>{{ assignment.lateSubmissions }}</dd>

            <dt>Peer review publish date and time</dt>
            <dd>{{ assignment.reviewPublishDate | formatDate }}</dd>

            <dt>Peer review due date and time</dt>
            <dd>{{ assignment.reviewDueDate | formatDate }}</dd>

            <dt>Allow late submission reviews</dt>
            <dd>{{ assignment.lateSubmissionReviews }}</dd>

            <dt>Block feedback for students who did not finish their reviews</dt>
            <dd>{{ assignment.blockFeedback }}</dd>

            <dt>Review Evaluation</dt>
            <dd>{{ assignment.reviewEvaluation }}</dd>

            <div v-if="assignment.reviewEvaluation">
                <dt>Review evaluation due date and time</dt>
                <dd>{{ assignment.reviewEvaluationDueDate | formatDate }}</dd>

                <dt>Allow late review evaluations</dt>
                <dd>{{ assignment.lateReviewEvaluations }}</dd>
            </div>

            <dt>Number of peer reviews assigned per student</dt>
            <dd>{{ assignment.reviewsPerUser }}</dd>

            <dt>Allowed submission file extensions</dt>
            <dd>{{ assignment.submissionExtensions }}</dd>

            <dt>Assignment File</dt>
            <dd v-if="assignment.file == null" class="text-danger">No assignment file uploaded</dd>
            <dd v-else>
                <a :href="assignmentFilePath" target="_blank">
                    {{ assignment.file.name }}{{ assignment.file.extension }}
                </a>
            </dd>

            <dt>Assignment Link</dt>
            <dd v-if="assignment.externalLink == null">No assignment link given</dd>
            <dd v-else>
                <a :href="'//' + assignment.externalLink" target="_blank">{{ assignment.externalLink }}</a>
            </dd>
        </dl>
    </b-card>
</template>

<script>
export default {
    props: ["assignment"],
    computed: {
        assignmentFilePath() {
            // Get the assignment file path.
            return `/api/assignments/${this.assignment.id}/file`
        }
    }
}
</script>
