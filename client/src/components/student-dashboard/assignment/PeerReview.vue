<template>
    <div>
        <!--Download-->
        <b-row>
            <b-col>
                <a target="_blank" :href="peerReviewFilePath">
                    <button type="button" class="btn btn-success success w-100" style="height: 3rem">
                        Click here to download the file that you have to review
                    </button>
                </a>
            </b-col>
        </b-row>

        <!--Form-->
        <b-card no-body class="mt-3">
            <!--Title-->
            <b-card-body v-if="readOnly === false">
                <h4>Assignment Criteria</h4>
                <h6 class="card-subtitle text-muted">Give the peer review to one of your peers here.</h6>
            </b-card-body>

            <!--Form-->
            <b-list-group flush>
                <!--Questions-->
                <b-list-group-item
                    class="py-4"
                    v-for="pair in peerReviewSorted.form"
                    :key="pair.question.id + pair.question.type_question"
                >
                    <!--Question Information-->
                    <div class="mb-2">
                        <h5 class="text-primary">
                            Question {{ pair.question.question_number }} of {{ totalAmountOfQuestions }}
                        </h5>
                        <b-badge pill v-if="pair.question.optional" variant="secondary" class="ml-2 float-right p-1">
                            OPTIONAL
                        </b-badge>
                        <b-badge v-else variant="danger" class="ml-2 float-right p-1">
                            REQUIRED
                        </b-badge>
                        <p>{{ pair.question.question }}</p>
                    </div>

                    <!-- OPEN QUESTION -->
                    <b-form-textarea
                        v-if="pair.question.type_question === 'open'"
                        id="textarea1"
                        placeholder="Enter something"
                        :rows="10"
                        :max-rows="15"
                        v-model="pair.answer.answer"
                        :readonly="peerReview.review.done || readOnly"
                        required
                        maxlength="90000"
                    />

                    <!-- RANGE QUESTION -->
                    <StarRating
                        v-else-if="pair.question.type_question === 'range'"
                        class="align-middle"
                        :border-color="'#007bff'"
                        :active-color="'#007bff'"
                        :border-width="2"
                        :item-size="20"
                        :spacing="5"
                        inline
                        :max-rating="Number(pair.question.range)"
                        :show-rating="false"
                        :read-only="peerReview.review.done || readOnly"
                        v-model="pair.answer.answer"
                    />

                    <!-- MPC QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'multiplechoice'">
                        <b-form-radio-group
                            :options="transformOptionsToHTMLOptions(pair.question.option)"
                            v-model="pair.answer.answer"
                            stacked
                            required
                            :disabled="peerReview.review.done || readOnly"
                        >
                        </b-form-radio-group>
                    </b-form-group>

                    <!-- CHECKBOX QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'checkbox'">
                        <b-form-checkbox-group
                            :options="transformOptionsToHTMLOptions(pair.question.option)"
                            v-model="pair.answer.answer"
                            stacked
                            required
                            :disabled="peerReview.review.done || readOnly"
                        >
                        </b-form-checkbox-group>
                    </b-form-group>

                    <!-- UPLOAD QUESTION -->
                    <div v-if="pair.question.type_question === 'upload'">
                        <!--File upload-->
                        <b-form-group
                            :description="
                                readOnly || peerReview.review.done
                                    ? ''
                                    : 'Select a  file and press save down below the page'
                            "
                            class="mb-0"
                        >
                            <!--Show whether file has been uploaded-->
                            <b-alert v-if="pair.answer.answer" show variant="success" class="p-2"
                                >File uploaded:
                                <a :href="uploadQuestionFilePath(peerReview.review.id, pair.question.id)">
                                    {{ pair.answer.answer }}
                                </a>
                            </b-alert>
                            <b-alert v-else show variant="warning" class="p-2">
                                Currently, no file has been uploaded. <br />
                                Allowed file types: {{ pair.question.extension }}
                            </b-alert>

                            <div v-if="!readOnly && !peerReview.review.done">
                                <!--Show note if a file has been uploaded and review not submitted-->
                                <b-alert v-if="pair.answer.answer" show variant="secondary" class="p-2"
                                    >Note: uploading a new file will overwrite your current file. <br />
                                    Allowed file types: {{ pair.question.extension }}
                                </b-alert>

                                <b-form-file
                                    placeholder="Choose a new file..."
                                    v-model="files[pair.question.id]"
                                    :state="Boolean(files[pair.question.id])"
                                    :accept="`${pair.question.extension}`"
                                    :disabled="peerReview.review.done || readOnly"
                                    :ref="'fileForm' + pair.question.id + peerReview.review.id"
                                >
                                </b-form-file>
                            </div>
                        </b-form-group>
                    </div>
                </b-list-group-item>
            </b-list-group>

            <SessionCheck ref="sessionCheck"></SessionCheck>

            <template v-if="peerReview.review.id !== null && readOnly === false">
                <!--Save/Submit Buttons-->
                <b-card-body v-if="!peerReview.review.done">
                    <b-btn type="submit" variant="success float-right" v-b-modal="`submit${peerReview.review.id}`"
                        >Submit Review</b-btn
                    >
                    <b-button variant="secondary float-right mr-2" @click="savePeerReview">Save Review</b-button>
                    <div>
                        <b-form-checkbox v-model="peerReview.review.flagged" name="reportButton" class="float-left">
                            Report this submission.
                        </b-form-checkbox>
                        <br />
                        <small>Only report if the submission is empty or not serious.</small>
                    </div>
                    <!--Submit Modal-->
                    <b-modal :id="`submit${peerReview.review.id}`" title="Submit Confirmation" @ok="submitPeerReview">
                        Do you really want to submit? This marks the review as finished.
                    </b-modal>
                </b-card-body>
                <b-card-body v-else>
                    <b-button variant="outline-success float-right" @click="unSubmitPeerReview"
                        >Unsubmit Review</b-button
                    >
                </b-card-body>
            </template>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api/api_old"
import { StarRating } from "vue-rate-it"
import notifications from "../../../mixins/notifications"
import SessionCheck from "../../general/SessionCheck"

export default {
    mixins: [notifications],
    components: {
        StarRating,
        SessionCheck
    },
    props: {
        reviewId: {
            type: Number
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            peerReview: {
                review: {
                    id: null,
                    rubric_id: null,
                    file_path: "",
                    comment: null,
                    done: null,
                    flagged: null
                },
                form: []
            },
            files: {}
        }
    },
    computed: {
        peerReviewSorted() {
            const tempForm = this.peerReview.form.slice().sort((a, b) => {
                return a.question.question_number - b.question.question_number
            })
            tempForm.forEach(element => {
                if (element.question.type_question === "checkbox" && !element.answer.answer) {
                    element.answer.answer = []
                }
            })
            // Returns the review object, but sorted on question number.
            return {
                review: this.peerReview.review,
                form: tempForm
            }
        },
        totalAmountOfQuestions() {
            // Returns the total amount of questions.
            return this.peerReview.form.length
        },
        peerReviewFilePath() {
            // Get the submission file path.
            return `/api/oldroutes/reviews/${this.peerReview.review.id}/file`
        }
    },
    async created() {
        await this.fetchPeerReview()
    },
    methods: {
        async fetchPeerReview() {
            try {
                let { data } = await api.getPeerReview(this.reviewId)
                this.peerReview = data
            } catch (e) {
                this.showErrorMessage({ message: "Could not fetch the review." })
            }
        },
        async submitPeerReview() {
            // Validate all fields (required).
            let validated = true
            this.peerReview.form.forEach(pair => {
                if (!pair.question.optional) {
                    if (pair.answer.answer === null || pair.answer.answer === undefined || pair.answer.answer === "") {
                        if (pair.question.type_question === "upload") {
                            return
                        }
                        validated = false
                    }
                }
            })

            // Give validation error/success based on validation.
            if (validated || this.peerReview.review.flagged) {
                // Save the peer review.
                await this.savePeerReview()

                // Submit peer review.
                try {
                    await api.submitPeerReview(this.peerReview)
                    try {
                        let { data } = await api.getPeerReview(this.reviewId)
                        this.peerReview = data
                    } catch (e) {
                        this.showErrorMessage({ message: "Could not fetch the review." })
                        return
                    }
                } catch (e) {
                    this.showErrorMessage({
                        message: "Submitting the review has failed. Make sure to fill in all required fields."
                    })
                    return
                }

                this.$emit("submitEvent")
                this.showSubmitMessage()
            } else {
                this.showErrorMessage({ message: "Please make sure to fill in all required fields." })
            }
        },
        async savePeerReview() {
            // Session check.
            const inSession = await this.$refs.sessionCheck.sessionGuardCheck()
            if (!inSession) {
                return
            }

            // Set up the form data (files in ROOT of formData) to send to server.
            const formData = new FormData()
            formData.append("review", JSON.stringify(this.peerReview.review))
            formData.append("form", JSON.stringify(this.peerReview.form))
            Object.entries(this.files).forEach(([key, value]) => formData.append(key, value))

            try {
                await api.savePeerReview(this.peerReview.review.id, formData)
                this.showSaveMessage({ message: "Your review has been saved successfully." })
                await this.fetchPeerReview()
                this.clearFiles()
            } catch (error) {
                this.showErrorMessage({ message: "Error saving peer review." })
            }
        },
        async unSubmitPeerReview() {
            // unSubmit peer review.
            try {
                await api.unSubmitPeerReview(this.peerReview)
                await this.fetchPeerReview()
                this.$emit("submitEvent")
                this.showUnSubmitMessage()
            } catch (error) {
                this.showErrorMessage({ message: "Error unsubmitting peer review." })
            }
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
        uploadQuestionFilePath(reviewId, questionId) {
            return `/api/oldroutes/reviews/${reviewId}/questions/${questionId}/file`
        },
        clearFiles() {
            // eslint-disable-next-line
            Object.entries(this.files).forEach(([key, _]) => {
                const name = "fileForm" + String(key) + this.peerReview.review.id
                this.$refs[name][0].reset()
                this.files[key] = null
            })
            this.files = {}
        }
    }
}
</script>
