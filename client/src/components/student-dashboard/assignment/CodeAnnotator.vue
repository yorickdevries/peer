<template>
    <div>
        <b-alert v-if="readOnly" show variant="warning">
            The file is read only, any annotations will not be saved
        </b-alert>
        <b-alert v-else-if="!review || review.submitted" show variant="warning">
            The review is submitted, so any annotations will not be saved.
        </b-alert>
        <b-alert :show="!showCode" variant="primary">LOADING CODE</b-alert>
        <b-card v-show="showCode">
            <CodeViewer :fileUrl="this.filePath" ref="codeViewer" />
            <b-popover placement="left" target="code-0" :triggers="['click']" title="Peer user">Text</b-popover>
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
            showCode: false
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
        }
    }
}
</script>
