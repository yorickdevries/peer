<template>
    <div>
        <!--View/Edit Comments-->
        <b-card header="View/Edit Comments" no-body class="mb-3">
            <b-list-group v-if="comments.length > 0" flush>
                <!--Single Comment-->
                <b-list-group-item v-for="comment in comments" :key="comment.id">
                    <dl class="mb-0">
                        <dt>Created by</dt>
                        <dd>{{ comment.netid }}</dd>
                    </dl>
                    <b-form-group
                        label="Comment"
                        description="A comment you can put on the submission the group/student submitted."
                    >
                        <b-form-textarea
                            v-model="comment.comment"
                            placeholder="Input your submission comment here."
                            rows="1"
                            max-rows="10"
                        ></b-form-textarea>
                    </b-form-group>
                    <b-button @click="editComment(comment.id, comment)" variant="success" size="sm" class="mr-2"
                        >Save
                    </b-button>
                    <b-button @click="deleteComment(comment.id)" variant="danger" size="sm">Delete</b-button>
                </b-list-group-item>
            </b-list-group>

            <!--No comment available text.-->
            <b-card-body v-else>
                No comments have been made.
            </b-card-body>
        </b-card>

        <!--Add Submission Comment-->
        <b-card header="Create Comment">
            <b-form-group
                label="Create comment"
                description="A comment you can put on the submission the group/student submitted."
            >
                <b-form-textarea
                    v-model="newComment.comment"
                    placeholder="Input your submission comment here."
                    rows="1"
                ></b-form-textarea>
            </b-form-group>
            <b-button @click="createSubmissionComment()" variant="success" size="sm">Create new comment</b-button>
        </b-card>
    </div>
</template>

<script>
import api from "../../api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["submissionId"],
    data() {
        return {
            comments: [],
            newComment: {
                comment: null
            }
        }
    },
    async created() {
        this.getSubmissionComments()
    },
    methods: {
        async getSubmissionComments() {
            try {
                let res = await api.client.get(`submissions/${this.submissionId}/allComments`)
                this.comments = res.data
            } catch (e) {
                console.log(e)
                this.showErrorMessage()
            }
        },
        async createSubmissionComment() {
            try {
                await api.client.post(`submissions/${this.submissionId}/comment`, this.newComment)
                this.getSubmissionComments()
                this.newComment.comment = null
                this.showSuccessMessage({ message: "Successfully created a comment." })
            } catch (e) {
                this.showErrorMessage()
            }
        },
        async deleteComment(commentId) {
            try {
                await api.client.delete(`submissions/${commentId}/comment`)
                this.getSubmissionComments()
                this.showSuccessMessage({ message: "Successfully deleted a comment." })
            } catch (e) {
                this.showErrorMessage()
            }
        },
        async editComment(commentId, comment) {
            try {
                await api.client.put(`submissions/${commentId}/comment`, comment)
                this.getSubmissionComments()
                this.showSuccessMessage({ message: "Successfully edited a comment." })
            } catch (e) {
                this.showErrorMessage()
            }
        }
    }
}
</script>
