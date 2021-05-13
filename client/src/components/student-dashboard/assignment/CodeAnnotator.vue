<template>
    <div>
        <form @submit.prevent="writeComment">
            <button type="submit" v-if="!writing">Leave a comment on highlighted part</button>
        </form>
        <form @submit.prevent="submitComment" v-if="writing">
            <button type="submit">Submit your comment</button>
            <b-form-textarea placeholder="Type your comment" v-model="commentText"></b-form-textarea>
        </form>

        <CodeViewer :fileUrl="fileUrl" />
    </div>
</template>

<script>
import CodeViewer from "../../general/CodeViewer"

export default {
    props: ["fileUrl", "reviewId", "submissionId", "readOnly"],
    components: { CodeViewer },
    data() {
        return {
            writing: false,
            highlightedText: null,
            lineNumber: null,
            commentText: null
        }
    },
    methods: {
        writeComment() {
            // TODO: Get selected text and line number
            const selectedText = window.getSelection().toString()
            // console.log(selectedText)

            // Do not update the state if nothing is selected
            if (selectedText.length == 0) {
                return
            }

            // Update the current state
            this.writing = true

            // Get highlighted text
            // this.highlightedText = selectedText

            // Get line number by navigating to the code element which contains the line number
            let codeElement = window.getSelection().anchorNode.parentElement
            while (codeElement.nodeName != "CODE") {
                codeElement = codeElement.parentElement
            }
            this.lineNumber = codeElement.getAttribute("linenr")

            // Index starts at 0, line numbers start at 1
            this.lineNumber++
        },
        submitComment() {
            // Update the current state
            this.writing = false

            // TODO: Do something with the gathered line and comment
            console.log(this.commentText)
            //console.log(this.highlightedText)
            console.log(this.lineNumber)
            this.commentText = null
            this.highlightedText = null
            this.highlightedLine = null
        }
    },
    created() {
        this.writing = false
    }
}
</script>
