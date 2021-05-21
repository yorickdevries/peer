<template>
    <div>
        <PDFViewer v-if="renderAs === 'document'" :fileUrl="fileUrl" />
        <CodeWrapper v-else-if="renderAs === 'code'" :fileUrl="fileUrl" :readOnly="true" />
        <div v-else>
            <b-alert show variant="secondary">
                No file preview is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
import JSZip from "jszip"
import CodeWrapper from "./CodeWrapper"
import PDFViewer from "./PDFViewer"

export default {
    components: {
        CodeWrapper,
        PDFViewer
    },
    props: ["fileUrl", "assignmentType"],
    data() {
        return {
            renderAs: ""
        }
    },
    created() {
        if (this.assignmentType) {
            this.renderAs = this.assignmentType
        } else {
            fetch(this.fileUrl)
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
}
</script>
