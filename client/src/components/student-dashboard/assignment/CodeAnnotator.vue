<template>
    <div class="d-flex flex-column" @mouseup="onMouseUp">
        <b-alert :show="!showCode" variant="primary">LOADING {{ review ? "REVIEW" : "SUBMISSION" }}</b-alert>

        <!-- The buttons and text area for the actual annotations, somewhat primitive -->
        <!-- Only show annotation buttons if this component is inside a non-submitted review -->
        <div v-if="!readOnly && !reviewSubmitted">
            <!-- TODO: beautify these input fields -->
            <b-alert variant="info" class="mb-1" show>
                Select a piece of code with your cursor to leave an annotation
            </b-alert>
            <b-form v-if="!writing" @submit.prevent="writeAnnotation" class="annotation-form mb-1">
                <b-button type="submit" variant="primary" style="margin-right: 10px" :disabled="!validateLineNumbers()">
                    Write an annotation
                </b-button>
                <p class="mb-auto mt-auto">Write annotation from line</p>
                <b-form-input
                    :type="number"
                    v-model="startLineNumber"
                    :state="validateLineNumbers()"
                    style="width: 90px; margin: 0px 10px"
                    class="mt-auto mb-auto"
                >
                </b-form-input>
                <p class="mb-auto mt-auto">to</p>
                <b-form-input
                    :type="number"
                    v-model="endLineNumber"
                    :state="validateLineNumbers()"
                    style="width: 90px; margin: 0px 10px"
                    class="mt-auto mb-auto"
                >
                </b-form-input>
            </b-form>
            <PeerTextarea
                v-if="writing"
                ref="textarea"
                class="mb-1"
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
                :selectionStart="propStartLine"
                :selectionEnd="propEndLine"
                :isOnlyFile="isOnlyFile"
                tabindex="0"
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
    props: ["annotations", "content", "language", "selectedFile", "readOnly", "review", "reviewColors", "isOnlyFile"],
    data() {
        return {
            showCode: false,
            writing: false,
            startLineNumber: null,
            endLineNumber: null,
            annotationText: "",
            highlightedFile: null,
            maxAnnotationLength: null,
            propStartLine: null,
            propEndLine: null
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
            if (!this.validateLineNumbers()) {
                this.showErrorMessage({
                    message: "The inputted line numbers are not allowed"
                })
                return
            }

            if (!this.doLineNumbersNotClash()) {
                this.startLineNumber = null
                this.endLineNumber = null
                this.showErrorMessage({ message: "Please select lines not yet annotated" })
            }

            // Update the current state and get highlighed text
            this.writing = true
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
            this.startLineNumber = null
            this.endLineNumber = null
            this.highlightedFile = null
        },
        deleteSelection() {
            this.startLineNumber = null
            this.endLineNumber = null
            this.highlightedFile = null
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
        },
        validateLineNumbers() {
            if (
                !this.startLineNumber ||
                this.startLineNumber === "" ||
                !this.endLineNumber ||
                this.endLineNumber === ""
            ) {
                this.propStartLine = null
                this.propEndLine = null
                return null
            }
            this.startLineNumber = parseInt(this.startLineNumber)
            this.endLineNumber = parseInt(this.endLineNumber)
            return (
                this.endLineNumber < this.content.length + 1 &&
                this.startLineNumber > 0 &&
                this.startLineNumber <= this.endLineNumber &&
                this.doLineNumbersNotClash()
            )
        },
        onMouseUp() {
            //TODO: not show selection when not allowed
            const selection = window.getSelection()
            const selectedText = selection.toString()

            // Get the line numbers from the selection when the selection is not empty
            if (selectedText.length != 0) {
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

                // If no code element is selected, the line numbers aren't updated
                if (startCodeElement == null || endCodeElement == null) {
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
            }
        },
        doLineNumbersNotClash() {
            /* Check if the line numbers overlap with an already made annotation in the same file. 
            This is done by iterating over all stored annotations, then checking if the line numbers
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
                    // If the line numbers are not allowed, no selection is shown
                    this.propStartLine = null
                    this.propEndLine = null
                    return false
                }
            }
            // If the line numbers are allowed, the selection is shown to the user
            this.propStartLine = parseInt(this.startLineNumber)
            this.propEndLine = parseInt(this.endLineNumber)
            return true
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
    max-height: 80vh;
    overflow: hidden;
}
</style>
