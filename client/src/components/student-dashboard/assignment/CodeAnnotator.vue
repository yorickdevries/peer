<template>
    <div>
        <b-alert v-if="readOnly" show variant="warning">
            The file is read only, any annotations will not be saved
        </b-alert>
        <b-alert v-else-if="!review || review.submitted" show variant="warning">
            The review is submitted, so any annotations will not be saved.
        </b-alert>
        <b-alert :show="!showCode" variant="primary">LOADING CODE</b-alert>

        <!-- The buttons and text area for the actual comments, somewhat primitive -->
        <!-- TODO: Upgrade the look of these buttons -->
        <form @submit.prevent="writeComment" v-if="!readOnly">
            <button type="submit" v-if="!writing">Leave a comment on highlighted part</button>
        </form>
        <form @submit.prevent="submitComment" v-if="writing && !readOnly">
            <button type="submit">Submit your comment</button>
            <b-form-textarea
                placeholder="Type your comment"
                v-model="commentText"
                rows="3"
                max-rows="5"
            ></b-form-textarea>
        </form>

        <b-card v-show="showCode">
            <CodeViewer :fileUrl="this.filePath" ref="codeViewer" />
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import CodeViewer from "../../general/CodeViewer"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    components: { CodeViewer },
    // either "reviewId" or "submissionId" is passed, not both
    props: ["reviewId", "submissionId", "readOnly", "filePath"],
    data() {
        return {
            review: null,
            submission: null,
            fileMetaData: null,
            codeDivId: null,
            showCode: false,
            writing: false,
            highlightedText: null,
            startLineNumber: null,
            endLineNumber: null,
            commentText: null,
            comments: []
        }
    },
    computed: {
        reviewFileName() {
            if (this.fileMetadata) {
                return this.fileMetadata.name + this.fileMetadata.extension
            } else {
                return ""
            }
        }
    },
    async created() {
        await this.fetchReview()
        await this.fetchSubmission()
        await this.fetchFileMetadata()
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
        async fetchFileMetadata() {
            if (this.review) {
                const res = await api.reviewofsubmissions.getFileMetadata(this.review.id)
                this.fileMetadata = res.data
            } else if (this.submission) {
                this.fileMetadata = this.submission.file
            }
        },
        async fetchComments() {
            this.comments = api.codeannotation.get(/*null, null*/)
        },
        async writeComment() {
            const selection = window.getSelection()
            const selectedText = selection.toString()

            // Do not update the state if nothing is selected
            if (selectedText.length == 0) {
                return
            }

            // Get start line number by navigating to the code element which contains the line number
            let startCodeElement = selection.anchorNode.parentElement
            while (startCodeElement != null && startCodeElement.nodeName != "CODE") {
                startCodeElement = startCodeElement.parentElement
            }
            // Get end line number like the start line number
            let endCodeElement = selection.focusNode.parentElement
            while (endCodeElement != null && endCodeElement.nodeName != "CODE") {
                endCodeElement = endCodeElement.parentElement
            }

            // TODO: error handling
            if (startCodeElement == null || endCodeElement == null) {
                //console.log("start is not a code element")
                this.showErrorMessage({ message: "Please make sure to select a piece of code" })
                return
            }
            this.startLineNumber = startCodeElement.getAttribute("linenr")
            this.endLineNumber = endCodeElement.getAttribute("linenr")

            // Index starts at 0, line numbers start at 1
            this.startLineNumber++
            this.endLineNumber++

            // Swap begin and end if they are reversed
            if (this.startLineNumber > this.endLineNumber) {
                let temp = this.startLineNumber
                this.startLineNumber = this.endLineNumber
                this.endLineNumber = temp
            }

            // Check if there are already made comments on these lines, signal error message if yes and reset line numbers
            for (const comment of this.comments) {
                if (
                    (comment.startLineNumber <= this.startLineNumber && comment.endLineNumber >= this.endLineNumber) ||
                    (comment.startLineNumber <= this.endLineNumber && comment.endLineNumber >= this.endLineNumber) ||
                    (comment.startLineNumber <= this.startLineNumber && comment.endLineNumber >= this.startLineNumber)
                ) {
                    this.startLineNumber = null
                    this.endLineNumber = null
                    this.showErrorMessage({ message: "Please select lines not yet commented on" })
                    return
                }
            }

            // Update the current state
            this.writing = true
            // Get highlighted text
            this.highlightedText = selectedText
        },
        // TODO: Update line to view comment, send all comments to the server
        async submitComment() {
            // Update the current state
            this.writing = false

            // Add comment to comments array
            this.comments[this.comments.length] = {
                commentText: this.commentText,
                startLineNumber: this.startLineNumber,
                endLineNumber: this.endLineNumber,
                highlightedText: this.highlightedText
            }
            // Send the comment to the server
            // TODO: update this method call
            api.codeannotation.post(this.commentText, this.startLineNumber, null, null)

            // Reset the highlighted text, comment text and line number
            this.commentText = null
            this.highlightedText = null
            this.startLineNumber = null
            this.endLineNumber = null
        }
    }
}
</script>
