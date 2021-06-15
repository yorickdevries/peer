<template>
    <div class="code-annotator">
        <b-alert :show="!showCode" variant="primary">LOADING {{ review ? "REVIEW" : "SUBMISSION" }}</b-alert>

        <!-- The buttons and text area for the actual annotations, somewhat primitive -->
        <!-- Only show annotation buttons if this component is inside a non-submitted review -->
        <div v-if="!readOnly && !reviewSubmitted" class="mb-3">
            <form v-if="!writing" @submit.prevent="writeAnnotation" class="annotation-form">
                <b-button type="submit" variant="primary">
                    Leave an annotation on the selected code
                </b-button>
                <b-alert variant="info" class="ml-3" show>
                    Select a piece of code with your cursor to leave an annotation
                </b-alert>
            </form>
            <PeerTextarea
                v-if="writing"
                ref="textarea"
                placeholder="Type your annotation"
                rows="3"
                max-rows="5"
                @submit="submitAnnotation"
                @cancel="deleteSelection"
                :maxLength="maxAnnotationLength"
                :defaultLanguage="language"
            />
        </div>

        <b-card v-show="showCode" id="codeannotations-card">
            <!--
                Displays the code with annotations in the mode specified by the readOnly variable.
                This is used to allow students to annotate code during the review stage, where readOnly is then false.
                When the review is submitted, but viewed in the review stage, readOnly will be true.
                This is also used to display the feedback received, where readOnly is then true.
             -->
            <CodeAnnotations
                @delete="onDeleteAnnotation"
                @edit="onEditedAnnotation"
                :content="content"
                :annotations="annotations"
                :language="language"
                :maxAnnotationLength="maxAnnotationLength"
                :selectedFile="selectedFile"
                :readOnly="readOnly || reviewSubmitted"
                :reviewColors="reviewColors"
                :selectionStart="startLineNumber"
                :selectionEnd="endLineNumber"
            />
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
    props: ["annotations", "content", "language", "selectedFile", "readOnly", "review", "reviewColors"],
    data() {
        return {
            showCode: false,
            writing: false,
            highlightedText: null,
            startLineNumber: null,
            endLineNumber: null,
            annotationText: "",
            highlightedFile: null,
            maxAnnotationLength: null
        }
    },
    async created() {
        await this.getMaxAnnotationLength()
        this.showCode = true
        this.writing = false
    },
    methods: {
        async getMaxAnnotationLength() {
            const res = await api.codeannotations.getMaxAnnotationLength()
            this.maxAnnotationLength = res.data
        },
        async writeAnnotation() {
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

            /* Check if the new annotation overlaps with an already made annotation in the same file. 
            This is done by iterating over all stored annotations, then checking if the new annotation
            is not either entirely before or after any of the stored and is in the same file.

            Because startLineNumber is always smaller than endLineNumber, this is checked by: 
            this.selectedFile === annotation.selectedFile &&
            (!(this.startLineNumber > annotation.endLineNumber || this.endLineNumber < annotation.startLineNumber))

            Applying DeMorgans law gives us:
            this.selectedFile === annotation.selectedFile &&
            (this.startLineNumber <= annotation.endLineNumber && this.endLineNumber >= annotation.startLineNumber)
            
            If at any time a clash occures, the user is shown an error message and is not allowed to write a annotation.*/
            for (const annotation of this.annotations) {
                if (
                    this.selectedFile === annotation.selectedFile &&
                    this.startLineNumber <= annotation.endLineNumber &&
                    this.endLineNumber >= annotation.startLineNumber
                ) {
                    this.startLineNumber = null
                    this.endLineNumber = null
                    this.showErrorMessage({ message: "Please select lines not yet annotated" })
                    return
                }
            }

            // Update the current state and get highlighed text
            this.writing = true
            this.highlightedText = selectedText
            this.highlightedFile = this.selectedFile
            window.getSelection().empty()
            this.$nextTick(() => this.$refs.textarea.$refs.textarea.focus())
        },
        async submitAnnotation(annotationText) {
            // Update the current state
            this.writing = false

            try {
                // Send the annotation to the server
                const res = await api.codeannotations.postAnnotation(
                    this.review.id,
                    annotationText,
                    this.startLineNumber,
                    this.endLineNumber,
                    this.selectedFile
                )
                const annotation = res.data
                this.annotations.push(annotation)
            } catch (error) {
                this.showErrorMessage({ message: "Unable to submit annotation" })
            }

            // Reset the highlighted text, annotation text and line number
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
        async onDeleteAnnotation(id) {
            // Remove annotation from annotation array
            this.annotations.splice(
                this.annotations.findIndex(annotation => annotation.id === id),
                1
            )
            // Remove annotation from back-end
            await api.codeannotations.deleteAnnotation(id)
            this.showSuccessMessage({ message: "Successfully deleted annotation" })
        },
        async onEditedAnnotation(id, updatedText) {
            const index = this.annotations.findIndex(annotation => annotation.id === id)
            const res = await api.codeannotations.patchAnnotation(id, updatedText)
            // Update only the annotation text
            this.annotations[index].annotationText = res.data.annotationText
            this.annotations.splice(index, 1, this.annotations[index])
            this.showSuccessMessage({ message: "Successfully updated annotation" })
        }
    },
    computed: {
        reviewSubmitted() {
            return this.review && this.review.submitted
        }
    }
}
</script>

<style lang="scss" scoped>
.code-annotator {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

.annotation-form {
    display: flex;
    align-items: stretch;

    .alert {
        margin: 0;
        flex-grow: 1;
    }
}

#codeannotations-card {
    flex-grow: 1;
    overflow: hidden;

    > .card-body {
        overflow: auto;
    }
}
</style>
