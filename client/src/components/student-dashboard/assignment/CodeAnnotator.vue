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
        <form @submit.prevent="writeComment">
            <button type="submit" v-if="!writing">Leave a comment on highlighted part</button>
        </form>
        <form @submit.prevent="submitComment" v-if="writing">
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

            <!--<b-popover placement="left" target="code-0" :triggers="['click']" title="Peer user">Text</b-popover>-->
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
// import axios from "axios"
// import izitoast from "izitoast"
import CodeViewer from "../../general/CodeViewer"

export default {
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
            lineNumber: null,
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
        async writeComment() {
            const selectedText = window.getSelection().toString()

            // Do not update the state if nothing is selected
            if (selectedText.length == 0) {
                return
            }

            // Update the current state
            this.writing = true

            // Get highlighted text
            this.highlightedText = selectedText

            // Get line number by navigating to the code element which contains the line number
            let codeElement = window.getSelection().anchorNode.parentElement
            while (codeElement.nodeName != "CODE") {
                codeElement = codeElement.parentElement
            }
            this.lineNumber = codeElement.getAttribute("linenr")

            // Index starts at 0, line numbers start at 1
            this.lineNumber++
        },
        // TODO: Update line to view comment, sort array comments on line number,
        // send all comments to the server once finished.
        async submitComment() {
            // Update the current state
            this.writing = false

            // TODO: Do something with the gathered line and comment
            console.log(this.commentText)
            console.log(this.lineNumber)
            console.log(this.highlightedText)
            this.comments[this.comments.length] = {
                commentText: this.commentText,
                lineNumber: this.lineNumber,
                highlightedText: this.highlightedText
            }

            // Reset the highlighted text, comment text and line number
            this.commentText = null
            this.highlightedText = null
            this.lineNumber = null
        }
    }
}
</script>
