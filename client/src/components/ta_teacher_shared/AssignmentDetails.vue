<template>
    <b-card header="Details">
        <dl class="mb-0">
            <dt>Description</dt>
            <dd>{{ assignment.description }}</dd>

            <dt>Publish date-time</dt>
            <dd>{{ assignment.publish_date | formatDate }}</dd>

            <dt>Assignment due date-time</dt>
            <dd>{{ assignment.due_date | formatDate }}</dd>

            <dt>Peer review publish date-time</dt>
            <dd>{{ assignment.review_publish_date | formatDate }}</dd>

            <dt>Peer review due date-tie=me</dt>
            <dd>{{ assignment.review_due_date | formatDate }}</dd>

            <dt>Amount of peer reviews assigned per student</dt>
            <dd>{{ assignment.reviews_per_user }}</dd>

            <dt>Assignment File</dt>
            <dd><a :href="assignmentFilePath">{{ assignment.filename }}</a></dd>
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
