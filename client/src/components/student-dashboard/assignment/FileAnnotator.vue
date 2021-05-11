<template>
    <div>
        <PDFAnnotator
            v-if="renderAs === 'document'"
            :reviewId="reviewId"
            :submissionId="submissionId"
            :readOnly="readOnly"
        />
        <!--
            TODO: Add CodeAnnotator component (?) and put it here
         -->
        <CodeViewer v-else-if="renderAs === 'code'" :fileUrl="filePath" />
        <div v-else>
            <b-alert show variant="secondary">
                No file annotation is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
import JSZip from "jszip"
import CodeViewer from "./../../general/CodeViewer"
import PDFAnnotator from "./PDFAnnotator"

export default {
    components: {
        CodeViewer,
        PDFAnnotator
    },
    props: ["reviewId", "submissionId", "readOnly"],
    computed: {
        filePath() {
            if (this.reviewId) {
                return `/api/reviewofsubmissions/${this.reviewId}/file`
            } else if (this.submissionId) {
                return `/api/submissions/${this.submissionId}/file`
            } else {
                return ""
            }
        }
    },
    data() {
        return {
            renderAs: ""
        }
    },
    created() {
        fetch(this.filePath)
            .then(res => res.blob())
            .then(file => {
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
}
</script>
