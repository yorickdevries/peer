<template>
    <div>
        <b-alert v-if="readOnly" show variant="warning">
            The file is read only, any annotations will not be saved
        </b-alert>
        <b-alert v-else-if="!review || review.submitted" show variant="warning">
            The review is submitted, so any annotations will not be saved.
        </b-alert>
        <b-alert :show="!showCode" variant="primary">LOADING {{ review ? "REVIEW" : "SUBMISSION" }}</b-alert>

        <!-- The buttons and text area for the actual comments, somewhat primitive -->
        <!-- TODO: Upgrade the look of these buttons -->
        <form @submit.prevent="writeComment" v-if="!readOnly">
            <button type="submit" v-if="!writing">Leave a comment on highlighted part</button>
        </form>
        <form @submit.prevent="submitComment" @reset.prevent="deleteSelection" v-if="writing && !readOnly">
            <button type="submit">Submit your comment</button>
            <button type="reset">Delete selection and comment</button>
            <b-form-textarea
                placeholder="Type your comment"
                v-model="commentText"
                rows="3"
                max-rows="5"
            ></b-form-textarea>
        </form>

        <b-card v-show="showCode">
            <CodeAnnotations
                @deleted="onDeleteComment"
                :content="content"
                :comments="comments"
                :selectedFile="selectedFile"
                ref="annotator"
            />
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import CodeAnnotations from "./CodeAnnotations"

export default {
    mixins: [notifications],
    components: { /*CodeViewer,*/ CodeAnnotations },
    // either "reviewId" or "submissionId" is passed, not both
    props: ["reviewId", "submissionId", "readOnly", "content", "selectedFile"],
    data() {
        return {
            review: null,
            submission: null,
            showCode: false,
            writing: false,
            highlightedText: null,
            startLineNumber: null,
            endLineNumber: null,
            commentText: null,
            highlightedFile: null,
            comments: []
        }
    },
    async created() {
        await this.fetchReview()
        await this.fetchSubmission()
        await this.fetchComments()
        this.showCode = true
        this.writing = false
    },
    methods: {
        async fetchReview() {
            if (this.reviewId) {
                const res = await api.reviewofsubmissions.get(this.reviewId)
                this.review = res.data
            }
        },
        async fetchSubmission() {
            if (this.submissionId) {
                const res = await api.submissions.get(this.submissionId)
                this.submission = res.data
            }
        },
        async fetchComments() {
            if (this.review) {
                try {
                    const res = await api.codeannotations.getAnnotations(this.review.id)
                    const rows = res.data
                    for (const row of rows) {
                        this.pushComment(row)
                    }
                } catch (error) {
                    this.comments = []
                }
            }
        },
        async writeComment() {
            const selection = window.getSelection()
            const selectedText = selection.toString()

            // Do not update the state if nothing is selected
            if (selectedText.length == 0) {
                this.showErrorMessage({ message: "Please make sure to select a piece of code" })
                return
            }

            // Get start line number by navigating to the code element which contains the line number
            let startCodeElement = selection.getRangeAt(0).startContainer
            while (startCodeElement != null && startCodeElement.nodeName != "CODE") {
                startCodeElement = startCodeElement.parentElement
            }
            // Get end line number like the start line number
            let endCodeElement = selection.getRangeAt(selection.rangeCount - 1).endContainer
            while (endCodeElement != null && endCodeElement.nodeName != "CODE") {
                endCodeElement = endCodeElement.parentElement
            }

            // If no code element is found for either the child or parent, the user is asked to
            // confirm they have selected code
            if (startCodeElement == null || endCodeElement == null) {
                this.showErrorMessage({ message: "Please make sure to select a piece of code" })
                return
            }
            this.startLineNumber = parseInt(startCodeElement.getAttribute("linenr"))
            this.endLineNumber = parseInt(endCodeElement.getAttribute("linenr"))

            // Swap startLineNumber and endLineNumber if startLineNumber is larger
            if (this.startLineNumber > this.endLineNumber) {
                let temp = this.startLineNumber
                this.startLineNumber = this.endLineNumber
                this.endLineNumber = temp
            }

            /* Check if the new comment overlaps with an already made comment in the same file. 
            This is done by iterating over all stored comments, then checking if the new comment 
            is not either entirely before or after any of the stored and is in the same file.

            Because startLineNumber is always smaller than endLineNumber, this is checked by: 
            this.selectedFile === comment.selectedFile &&
            (!(this.startLineNumber > comment.endLineNumber || this.endLineNumber < comment.startLineNumber))

            Applying DeMorgans law gives us:
            this.selectedFile === comment.selectedFile &&
            (this.startLineNumber <= comment.endLineNumber && this.endLineNumber >= comment.startLineNumber)
            
            If at any time a clash occures, the user is shown an error message and is not allowed to write a comment.*/
            for (const comment of this.comments) {
                if (
                    this.selectedFile === comment.selectedFile &&
                    this.startLineNumber <= comment.endLineNumber &&
                    this.endLineNumber >= comment.startLineNumber
                ) {
                    this.startLineNumber = null
                    this.endLineNumber = null
                    this.showErrorMessage({ message: "Please select lines not yet commented on" })
                    return
                }
            }

            // Update the current state and get highlighed text
            this.writing = true
            this.highlightedText = selectedText
            this.highlightedFile = this.selectedFile
        },
        async submitComment() {
            // Update the current state
            this.writing = false

            try {
                // Send the comment to the server
                const res = await api.codeannotations.postAnnotation(
                    this.review.id,
                    this.commentText,
                    this.startLineNumber,
                    this.endLineNumber,
                    this.selectedFile
                )
                const comment = res.data
                this.pushComment(comment)
            } catch (error) {
                this.showErrorMessage({ message: "Unable to submit comment" })
            }

            // Reset the highlighted text, comment text and line number
            this.commentText = null
            this.highlightedText = null
            this.startLineNumber = null
            this.endLineNumber = null
            this.highlightedFile = null
        },
        // Add comment to comments array using Array.splice to make CodeAnnotations.vue react to the change
        pushComment(comment) {
            this.comments.push({
                commentId: comment.id,
                commentText: comment.commentText,
                startLineNumber: comment.startLineNumber,
                endLineNumber: comment.endLineNumber,
                highlightedText: "TO DO",
                selectedFile: comment.selectedFile
            })
        },
        deleteSelection() {
            this.commentText = null
            this.highlightedText = null
            this.startLineNumber = null
            this.endLineNumber = null
            this.writing = false
            this.showSuccessMessage({ message: "Your selection and comment was deleted" })
        },
        onDeleteComment(index) {
            if (index < 0 || index >= this.comments.length) {
                return
            }

            // Remove comment from comment array
            const removedComment = this.comments.splice(index, 1)
            // Remove comment from back-end
            api.codeannotations.deleteAnnotation(removedComment[0].commentId)
            this.showSuccessMessage({ message: "Successfully deleted comment" })
        }
    }
}
</script>
