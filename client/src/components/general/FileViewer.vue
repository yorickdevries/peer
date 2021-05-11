<template>
    <div>
        <PDFViewer v-if="assignmentType === 'document' || fileExtension === '.pdf'" :fileUrl="fileUrl" />
        <CodeViewer v-else-if="assignmentType === 'code'" :fileUrl="fileUrl" :fileExtension="fileExtension" />
        <div v-else>
            <b-alert show variant="secondary">
                No file preview is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
import CodeViewer from "./CodeViewer"
import PDFViewer from "./PDFViewer"

export default {
    components: {
        CodeViewer,
        PDFViewer
    },
    props: ["fileUrl", "assignmentType"],
    data() {
        return {
            fileExtension: null
        }
    },
    created() {
        this.fileExtension = this.fileUrl.split(".").pop()
    }
}
</script>
