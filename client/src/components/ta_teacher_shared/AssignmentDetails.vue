<template>
    <b-card header="Details">
        <dl class="mb-0">
            <dt>Description</dt>
            <dd>{{ assignment.description }}</dd>

            <dt>Publish date and time</dt>
            <dd>{{ assignment.publish_date | formatDate }}</dd>

            <dt>Assignment due date and time</dt>
            <dd>{{ assignment.due_date | formatDate }}</dd>

            <dt>Peer review publish date and time</dt>
            <dd>{{ assignment.review_publish_date | formatDate }}</dd>

            <dt>Peer review due date and time</dt>
            <dd>{{ assignment.review_due_date | formatDate }}</dd>

            <dt v-if="assignment.review_evaluation_due_date != null">Review evaluation due date and time</dt>
            <dd v-if="assignment.review_evaluation_due_date != null">{{ assignment.review_evaluation_due_date | formatDate }}</dd>

            <dt>Amount of peer reviews assigned per student</dt>
            <dd>{{ assignment.reviews_per_user }}</dd>

            <dt>Assignment File</dt>
            <dd v-if="assignment.filename == null" class="text-danger"> No assignment file uploaded </dd>
            <dd v-else><a :href="assignmentFilePath" target="_blank">{{ assignment.filename }}</a></dd>

            <dt>Assignment Link</dt>
            <dd v-if="assignment.external_assignment_link == null"> No assignment link given</dd>
            <dd v-else><a :href="assignment.external_assignment_link" target="_blank">{{ assignment.external_assignment_link }}</a></dd>
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
            },
        },
    }
</script>
