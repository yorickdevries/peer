<template>
    <div class="d-flex flex-column">
        <b-alert :show="!showCode" variant="primary">LOADING {{ review ? "REVIEW" : "SUBMISSION" }}</b-alert>

        <!-- The buttons and text area for the actual comments, somewhat primitive -->
        <!-- Only show annotation buttons if this component is inside a non-submitted review -->
        <div v-if="!readOnly && !reviewSubmitted && showAnnotations" class="mb-3">
            <form v-if="!writing" @submit.prevent="writeComment" class="annotation-form">
                <b-button type="submit" variant="primary">
                    Leave a comment on the selected code
                </b-button>
                <b-alert variant="info" class="ml-3" show>
                    Select a piece of code with your cursor to leave a comment
                </b-alert>
            </form>
            <PeerTextarea
                v-if="writing"
                placeholder="Type your comment"
                rows="3"
                max-rows="5"
                @submit="submitComment"
                @cancel="deleteSelection"
                :maxLength="maxCommentLength"
                :defaultLanguage="language"
            />
        </div>

        <b-card v-show="showCode" style="flex-grow: 1">
            <!--
                Displays the code with annotations in the mode specified by the readOnly variable.
                This is used to allow students to annotate code during the review stage, where readOnly is then false.
                When the review is submitted, but viewed in the review stage, readOnly will be true.
                This is also used to display the feedback received, where readOnly is then true.
             -->
            <CodeAnnotations
                v-if="showAnnotations"
                @deleted="onDeleteComment"
                @edited="onEditedComment"
                :content="content"
                :comments="comments"
                :language="language"
                :maxCommentLength="maxCommentLength"
                :selectedFile="selectedFile"
                :readOnly="readOnly || reviewSubmitted"
            />
            <!--
                Display the code without annotations.
                This is used for students to view their current final submission, where readOnly is always true.
            -->
            <CodeAnnotations v-else :content="content" :comments="[]" :selectedFile="selectedFile" :readOnly="true" />
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import CodeAnnotations from "./CodeAnnotations"
import PeerTextarea from "./PeerTextarea"

export default {
    mixins: [notifications],
    components: { CodeAnnotations, PeerTextarea },
    props: ["comments", "content", "language", "selectedFile", "readOnly", "review"],
    data() {
        return {
            showCode: false,
            writing: false,
            highlightedText: null,
            startLineNumber: null,
            endLineNumber: null,
            commentText: "",
            highlightedFile: null,
            maxCommentLength: null
        }
    },
    async created() {
        await this.getMaxCommentLength()
        this.showCode = true
        this.writing = false
    },
    methods: {
        async getMaxCommentLength() {
            const res = await api.codeannotations.getMaxCommentLength()
            this.maxCommentLength = res.data
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
        async submitComment(commentText) {
            // Update the current state
            this.writing = false

            try {
                // Send the comment to the server
                const res = await api.codeannotations.postAnnotation(
                    this.review.id,
                    commentText,
                    this.startLineNumber,
                    this.endLineNumber,
                    this.selectedFile
                )
                const comment = res.data
                this.comments.push(comment)
            } catch (error) {
                this.showErrorMessage({ message: "Unable to submit comment" })
            }

            // Reset the highlighted text, comment text and line number
            this.highlightedText = null
            this.startLineNumber = null
            this.endLineNumber = null
            this.highlightedFile = null
        },
        deleteSelection() {
            this.highlightedText = null
            this.startLineNumber = null
            this.endLineNumber = null
            this.writing = false
        },
        async onDeleteComment(index) {
            // Remove comment from comment array
            const removedComment = this.comments.splice(index, 1)
            // Remove comment from back-end
            await api.codeannotations.deleteAnnotation(removedComment[0].id)
            this.showSuccessMessage({ message: "Successfully deleted comment" })
        },
        async onEditedComment(index, updatedText) {
            let comment = this.comments[index]
            const res = await api.codeannotations.patchAnnotation(comment.id, updatedText)
            // Update only the comment text
            comment.commentText = res.data.commentText
            this.comments.splice(index, 1, comment)
            this.showSuccessMessage({ message: "Successfully updated comment" })
        }
    },
    computed: {
        showAnnotations() {
            return !(this.review == null)
        },
        reviewSubmitted() {
            return this.review && this.review.submitted
        }
    }
}
</script>

<style lang="scss" scoped>
.annotation-form {
    display: flex;
    align-items: stretch;

    .alert {
        margin: 0;
        flex-grow: 1;
    }
}
</style>
