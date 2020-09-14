<template>
    <div>
        <b-alert v-if="readOnly" show variant="warning">
            The review is read only, any annotations will not be saved</b-alert
        >
        <b-alert v-else-if="!review || review.submitted" show variant="warning">
            The review is submitted, any annotations will not be saved</b-alert
        >
        <b-alert show variant="secondary"
            >PDF viewing and annotation is experimental, in case of any error, you can always download the file with the
            button above.
            <br />
            <b
                >NOTE: Altough annotations contain your netid, anonymous annotations will be shown to the reviewed
                person.</b
            >
        </b-alert>
        <!--Annotation view-->
        <div :id="pdfDivId" style="height: 1000px">
            <b-alert show variant="primary">LOADING REVIEW PDF</b-alert>
        </div>
    </div>
</template>

<script>
import api from "../../../api/api"
import axios from "axios"
import izitoast from "izitoast"

export default {
    // either "reviewId" or "submissionId" is passed, not both
    props: ["reviewId", "submissionId", "readOnly"],
    data() {
        return {
            // my API key for localhost
            adobeDCViewClientId:
                process.env.NODE_ENV === "production"
                    ? "e15abfc9f499445e9acb8cdc19482196"
                    : "b3c8121ca4ba4dd0af5424097b94538d",
            review: null,
            submission: null,
            fileMetadata: null,
            pdfDivId: null
        }
    },
    computed: {
        filePath() {
            if (this.review) {
                return `/api/reviewofsubmissions/${this.review.id}/file`
            } else if (this.submission) {
                return `/api/submissions/${this.submission.id}/file`
            } else {
                return ""
            }
        },
        reviewFileName() {
            if (this.fileMetadata) {
                return this.fileMetadata.name + this.fileMetadata.extension
            } else {
                return ""
            }
        }
    },
    async mounted() {
        // the page needs to be mounted as the pdf library is dynamically inserted
        await this.fetchReview()
        await this.fetchSubmission()
        await this.fetchFileMetadata()
        // generate random number for id
        this.pdfDivId = "adobe-dc-view-" + String(Math.floor(Math.random() * Math.pow(10, 9)))
        this.renderPDF()
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
        },
        renderPDF() {
            // Documentation: https://www.adobe.io/apis/documentcloud/dcsdk/docs.html
            // inject the PDF embed API script
            const script = document.createElement("script")
            script.setAttribute("src", "https://documentcloud.adobe.com/view-sdk/main.js")
            document.head.appendChild(script)

            // set vue model to constant
            const vm = this

            // construct the file promise
            const filePromise = new Promise(function(resolve, reject) {
                axios
                    .get(vm.filePath, { responseType: "arraybuffer" })
                    .then(res => {
                        resolve(res.data)
                    })
                    .catch(error => reject(error))
            })

            // load the pdf in the website
            document.addEventListener("adobe_dc_view_sdk.ready", function() {
                // AdobeDC is loaded via the script, so eslint is disabled:
                // eslint-disable-next-line no-undef
                const adobeDCView = new AdobeDC.View({
                    clientId: vm.adobeDCViewClientId,
                    divId: vm.pdfDivId
                })

                // Set user profile
                // eslint-disable-next-line no-undef
                adobeDCView.registerCallback(AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API, function() {
                    return new Promise((resolve, reject) => {
                        api.getMe()
                            .then(res => {
                                // fetch user info
                                const profile = {
                                    userProfile: {
                                        name: res.data.netid
                                    }
                                }
                                resolve({
                                    // eslint-disable-next-line no-undef
                                    code: AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                                    data: profile
                                })
                            })
                            .catch(error =>
                                reject({
                                    // eslint-disable-next-line no-undef
                                    code: AdobeDC.View.Enum.ApiResponseCode.FAIL,
                                    data: error
                                })
                            )
                    })
                })

                // Store the UI options in a constant
                const previewConfig = {
                    defaultViewMode: "FIT_WIDTH",
                    enableAnnotationAPIs: true,
                    includePDFAnnotations: true
                }
                const previewFilePromise = adobeDCView.previewFile(
                    {
                        content: { promise: filePromise },
                        metaData: {
                            fileName: vm.reviewFileName,
                            id: String(vm.fileMetadata.id) // id needs to be a string
                        }
                    },
                    previewConfig
                )

                /* Use the annotation manager interface to invoke the commenting APIs */
                previewFilePromise.then(function(adobeViewer) {
                    adobeViewer.getAnnotationManager().then(async function(annotationManager) {
                        // get existing annotations
                        let reviews = []
                        // add single review
                        if (vm.review) {
                            reviews.push(vm.review)
                        }
                        // add all feedback of submission
                        if (vm.submission) {
                            const res = await api.submissions.getFeedback(vm.submission.id)
                            const feedbackReviews = res.data
                            for (const feedbackReview of feedbackReviews) {
                                reviews.push(feedbackReview)
                            }
                        }

                        // iterate over all reviews to get annotations
                        for (const review of reviews) {
                            const res = await api.pdfannotations.get(review.id, vm.fileMetadata.id)
                            const annotations = res.data
                            /* API to add annotations */
                            for (const annotation of annotations) {
                                try {
                                    await annotationManager.addAnnotations([annotation])
                                } catch (error) {
                                    console.log(error)
                                }
                            }
                        }

                        /* API to register events listener */
                        // only if a review is known and the view is not readonly
                        if (vm.review && !vm.review.submitted && !vm.readOnly) {
                            annotationManager.registerEventListener(
                                async function(event) {
                                    switch (event.type) {
                                        case "ANNOTATION_ADDED":
                                            await api.pdfannotations.post(event.data, vm.review.id, vm.fileMetadata.id)
                                            izitoast.success({
                                                title: "Success",
                                                message: "Succesfully created annotation",
                                                position: "bottomCenter"
                                            })
                                            break
                                        case "ANNOTATION_UPDATED":
                                            await api.pdfannotations.patch(event.data.id, event.data)
                                            izitoast.success({
                                                title: "Success",
                                                message: "Succesfully changed annotation",
                                                position: "bottomCenter"
                                            })
                                            break
                                        case "ANNOTATION_DELETED":
                                            await api.pdfannotations.delete(event.data.id)
                                            izitoast.success({
                                                title: "Success",
                                                message: "Succesfully deleted annotation",
                                                position: "bottomCenter"
                                            })
                                            break
                                        default:
                                            console.log(`Invalid event: ${event.type}`)
                                            return
                                    }
                                },
                                {
                                    /* Pass the list of events in listenOn. */
                                    /* If no event is passed in listenOn, then all the annotation events will be received. */
                                    listenOn: ["ANNOTATION_ADDED", "ANNOTATION_UPDATED", "ANNOTATION_DELETED"]
                                }
                            )
                        } else {
                            annotationManager.registerEventListener(
                                async function(event) {
                                    if (event.type === "ANNOTATION_SELECTED" || event.type === "ANNOTATION_CLICKED") {
                                        annotationManager.unselectAnnotation()
                                    } else {
                                        if (event.type === "ANNOTATION_ADDED") {
                                            // not allowed, so directly deleting it
                                            annotationManager.deleteAnnotations({ annotationIds: [event.data.id] })
                                        }
                                        izitoast.error({
                                            title: "Error",
                                            message: "Invalid action: " + event.type,
                                            position: "bottomCenter"
                                        })
                                    }
                                },
                                {
                                    /* Pass the list of events in listenOn. */
                                    /* If no event is passed in listenOn, then all the annotation events will be received. */
                                    listenOn: [
                                        "ANNOTATION_ADDED",
                                        "ANNOTATION_UPDATED",
                                        "ANNOTATION_DELETED",
                                        "ANNOTATION_SELECTED",
                                        "ANNOTATION_CLICKED"
                                    ]
                                }
                            )
                        }
                    })
                })
            })
        }
    }
}
</script>
