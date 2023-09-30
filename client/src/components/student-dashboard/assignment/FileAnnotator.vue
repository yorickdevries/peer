<template>
    <div>
        <PDFAnnotator
            v-if="renderAs === 'document'"
            :reviewId="reviewId"
            :submissionId="submissionId"
            :readOnly="readOnly"
            :reviewColors="reviewColors || defaultReviewColor"
            :ignoreAnnotations="ignoreAnnotations"
        />
        <CodeWrapper
            v-else-if="renderAs === 'code'"
            :fileUrl="filePath"
            :readOnly="readOnly"
            :submissionId="submissionId"
            :reviewId="reviewId"
            :reviewColors="reviewColors || defaultReviewColor"
            :ignoreAnnotations="ignoreAnnotations"
        />
        <JupyterWrapper v-else-if="renderAs === 'jupyter'" ref="jupyterEditor" :file="file" />
        <div v-else>
            <b-alert show variant="secondary">
                No file annotation is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
import JSZip from "jszip"
import CodeWrapper from "./../../general/CodeWrapper"
import PDFAnnotator from "./PDFAnnotator"
import JupyterWrapper from "./../../general/JupyterWrapper"

export default {
    components: {
        CodeWrapper,
        PDFAnnotator,
        JupyterWrapper,
    },
    props: ["reviewId", "submissionId", "readOnly", "assignmentType", "reviewColors", "ignoreAnnotations", "file"],
    computed: {
        filePath() {
            if (this.reviewId) {
                return `/api/reviewofsubmissions/${this.reviewId}/file`
            } else if (this.submissionId) {
                return `/api/submissions/${this.submissionId}/file`
            } else {
                return ""
            }
        },
        defaultReviewColor() {
            return { [this.reviewId]: "#ffb000" }
        },
    },
    data() {
        return {
            renderAs: "",
            jupText: "",
        }
    },
    methods: {
        async makeJupFile() {
            this.jupText = this.$refs.jupyterEditor.getJupyterText()
            const blob = new Blob([this.jupText], { type: "text/plain" })
            return new File([blob], "jupyterSubmission.ipynb", { type: "text/plain" })
        },
    },
    created() {
        if (this.assignmentType) {
            this.renderAs = this.assignmentType
            if (this.file.extension == ".ipynb") {
                this.renderAs = "jupyter"
            }
        } else {
            fetch(this.filePath)
                .then((res) => res.blob())
                .then((file) => {
                    if (file.type.includes("text/plain")) {
                        // The given file contains plain text and should be rendered as code
                        this.renderAs = "code"
                    } else {
                        // The given file contains binary data, we should test whether it is a zip or a
                        // pdf
                        JSZip.loadAsync(file)
                            .then(() => {
                                // JSZip thinks this file is a zip file, so it should be rendered as
                                // code
                                this.renderAs = "code"
                            })
                            .catch(() => {
                                // JSZip could not unzip the file, which means it might be a pdf file
                                // so it should be rendered as a pdf
                                this.renderAs = "document"
                            })
                    }
                })
                .catch(console.error)
        }
    },
}
</script>
