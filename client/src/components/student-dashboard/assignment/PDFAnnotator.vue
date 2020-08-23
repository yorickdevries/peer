<template>
    <!--Annotation view-->
    <div id="adobe-dc-view" style="height: 1000px"></div>
</template>

<script>
import api from "../../../api/api"
import axios from "axios"

export default {
    props: ["reviewId"],
    data() {
        return {
            // my API key for localhost
            adobeDCViewClientId: "b3c8121ca4ba4dd0af5424097b94538d",
            review: null,
            fileMetadata: null
        }
    },
    computed: {
        reviewFilePath() {
            // Get the submission file path.
            return `/api/reviewofsubmissions/${this.review.id}/file`
        },
        reviewFileName() {
            return this.fileMetadata.name + this.fileMetadata.extension
        }
    },
    async mounted() {
        // the page needs to be mounted as the pdf library is dynamically inserted
        await this.fetchReview()
        await this.fetchFileMetadata()
        this.renderPDF()
    },
    methods: {
        async fetchReview() {
            const res = await api.reviewofsubmissions.get(this.reviewId)
            this.review = res.data
        },
        async fetchFileMetadata() {
            const res = await api.reviewofsubmissions.getFileMetadata(this.review.id)
            this.fileMetadata = res.data
        },
        renderPDF() {
            // inject the PDF embed API script
            const script = document.createElement("script")
            script.setAttribute("src", "https://documentcloud.adobe.com/view-sdk/main.js")
            document.head.appendChild(script)

            // get fields into constants
            const clientId = this.adobeDCViewClientId
            const reviewId = this.review.id
            // file info
            const fileName = this.reviewFileName
            const fileId = this.fileMetadata.id
            const filePath = this.reviewFilePath
            // construct the file promise
            const filePromise = new Promise(function(resolve, reject) {
                axios
                    .get(filePath, { responseType: "arraybuffer" })
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
                    clientId: clientId,
                    divId: "adobe-dc-view"
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
                            fileName: fileName,
                            id: String(fileId) // id needs to be a string
                        }
                    },
                    previewConfig
                )

                /* Use the annotation manager interface to invoke the commenting APIs */
                previewFilePromise.then(function(adobeViewer) {
                    adobeViewer.getAnnotationManager().then(async function(annotationManager) {
                        // get existing annotations
                        const res = await api.pdfannotations.get(reviewId, fileId)
                        const annotations = res.data
                        /* API to add annotations */
                        for (const annotation of annotations) {
                            try {
                                await annotationManager.addAnnotations([annotation])
                            } catch (error) {
                                console.log(error)
                            }
                        }

                        /* API to register events listener */
                        annotationManager.registerEventListener(
                            async function(event) {
                                switch (event.type) {
                                    case "ANNOTATION_ADDED":
                                        await api.pdfannotations.post(event.data, reviewId, fileId)
                                        break
                                    case "ANNOTATION_UPDATED":
                                        await api.pdfannotations.patch(event.data.id, event.data)
                                        break
                                    case "ANNOTATION_DELETED":
                                        await api.pdfannotations.delete(event.data.id)
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
                    })
                })
            })
        }
    }
}
</script>
