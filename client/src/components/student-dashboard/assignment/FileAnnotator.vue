<template>
    <div>
        <PDFAnnotator
            v-if="assignmentType === 'document' || fileExtension === '.pdf'"
            :reviewId="reviewId"
            :submissionId="submissionId"
            :readOnly="readOnly"
        />
        <!--
            TODO: Add CodeAnnotator component (?) and put it here
         -->
        <CodeViewer v-else-if="assignmentType === 'code'" :fileUrl="this.filePath" :fileExtension="fileExtension" />
        <div v-else>
            <b-alert show variant="secondary">
                No file annotation is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
// TODO: Add CodeAnnotator component (?) and put it here
import CodeViewer from "./../../general/CodeViewer"
import PDFAnnotator from "./PDFAnnotator"

export default {
    components: {
        CodeViewer,
        PDFAnnotator
    },
    props: ["reviewId", "submissionId", "readOnly", "assignmentType", "fileExtension"],
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
    }
}
</script>
