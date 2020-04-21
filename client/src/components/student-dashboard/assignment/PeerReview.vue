<template>
    <div>

        <!--Download-->
        <b-row>
            <b-col>
                <a target="_blank" :href="peerReviewFilePath">
                    <button type="button" class="btn btn-success success w-100"
                            style="height: 3rem">Click here to download the file that you have to review
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
                <b-list-group-item class="py-4" v-for="pair in peerReviewSorted.form"
                                   :key="pair.question.id + pair.question.type_question">

                    <!--Question Information-->
                    <div class="mb-2">
                        <h5 class="text-primary">Question {{ pair.question.question_number }} of {{
                            totalAmountOfQuestions }}</h5>
                        <p>{{ pair.question.question }}</p>
                    </div>

                    <!-- OPEN QUESTION -->
                    <b-form-textarea v-if="pair.question.type_question === 'open'"
                                     id="textarea1"
                                     placeholder="Enter something"
                                     :rows="10"
                                     :max-rows="15"
                                     v-model="pair.answer.answer"
                                     :readonly="peerReview.review.done || readOnly"
                                     required
                                     maxlength="90000"/>

                    <!-- RANGE QUESTION -->
                    <StarRating v-else-if="pair.question.type_question === 'range'"
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
                                v-model="pair.answer.answer"/>

                    <!-- MPC QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'mc'">
                        <b-form-radio-group
                                :options="transformOptionsToHTMLOptions(pair.question.option)"
                                v-model="pair.answer.answer"
                                stacked
                                required
                                :disabled="peerReview.review.done || readOnly">
                        </b-form-radio-group>
                    </b-form-group>

                    <!-- UPLOAD QUESTION -->
                    <div v-if="pair.question.type_question === 'upload'">

                        <!--File upload-->
                        <b-form-group :description="readOnly ? '' : 'Select a file and press save down below the page. Note: it overwrites files.'" class="mb-0">

                            <!--Show currently uploaded file-->
                            <b-alert class="d-flex justify-content-between flex-wrap" show variant="secondary">
                                <!--Buttons for toggling new assignment upload-->
                                <div>
                                    <div v-if="pair.answer.answer">File uploaded: <a
                                            :href="uploadQuestionFilePath(peerReview.review.id, pair.question.id)">{{ pair.answer.answer }}</a></div>
                                    <div v-else>You currently have no file uploaded.</div>
                                </div>
                            </b-alert>

                            <div v-if="!readOnly && !peerReview.review.done">
                                <b-alert show variant="danger">{{ pair.question.extension.toUpperCase() }} files allowed only.</b-alert>

                                <b-alert v-if="pair.answer.answer" show variant="warning">Note: uploading an new files will overwrite your current file.</b-alert>

                                <b-form-file  placeholder="Choose a new file..."
                                              v-model="files[pair.question.id]"
                                              :state="Boolean(files[pair.question.id])"
                                              :accept="`.${pair.question.extension}`"
                                              :disabled="peerReview.review.done || readOnly"
                                              :ref="'fileForm' + pair.question.id + peerReview.review.id">
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
                    <b-btn type="submit" variant="success float-right" v-b-modal="`submit${peerReview.review.id}`">Submit Review</b-btn>
                    <b-button variant="secondary float-right mr-2" @click="savePeerReview">Save Review</b-button>
                    <div>
                        <b-form-checkbox v-model="peerReview.review.flagged" name="reportButton" class="float-left">
                            Report this submission.
                        </b-form-checkbox>
                        <br />
                        <small>Only report if the submission is empty or not serious.</small>
                    </div>
                    <!--Submit Modal-->
                    <b-modal    :id="`submit${peerReview.review.id}`"
                                title="Submit Confirmation"
                                @ok="submitPeerReview">
                        Do you really want to submit? This marks the review as finished.
                    </b-modal>
                </b-card-body>
                <b-card-body v-else>
                    <b-button variant="outline-success float-right" @click="unSubmitPeerReview">Unsubmit Review</b-button>
                </b-card-body>
            </template>

        </b-card>

    </div>
</template>

<script>
import api from "../../../api"
import { StarRating } from 'vue-rate-it';
import notifications from '../../../mixins/notifications'
import SessionCheck from '../../general/SessionCheck'

export default {
    mixins: [notifications],
    components: {
        StarRating,
        SessionCheck,
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
                    flagged: null,
                },
                form: []
            },
            files: {},
        }
    },
    computed: {
        peerReviewSorted() {
            // Returns the review object, but sorted on question number.
            return {
                review: this.peerReview.review,
                form: this.peerReview.form.slice().sort((a, b) => {
                    return a.question.question_number - b.question.question_number
                })
            }
        },
        totalAmountOfQuestions() {
            // Returns the total amount of questions.
            return this.peerReview.form.length
        },
        peerReviewFilePath() {
            // Get the submission file path.
            return `/api/reviews/${this.peerReview.review.id}/file`
        }
    },
    async created() {
        await this.fetchPeerReview()
    },
    methods: {
        async fetchPeerReview() {
            try {
                let {data} = await api.getPeerReview(this.reviewId)
                this.peerReview = data
            } catch (e) {
                this.showErrorMessage({message: "Could not fetch the review."})
            }

        },
        async submitPeerReview() {

            // Validate all fields (required).
            let validated = true;
            this.peerReview.form.forEach(pair => {
                if (pair.answer.answer === null || pair.answer.answer === undefined || pair.answer.answer === "") {
                    if (pair.question.type_question === 'upload') {
                        return
                    }
                    validated = false
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
                        let {data} = await api.getPeerReview(this.reviewId)
                        this.peerReview = data
                    } catch (e) {
                        this.showErrorMessage({message: "Could not fetch the review."})
                        return
                    }
                } catch (e) {
                    this.showErrorMessage({message: "Submitting the review has failed. Make sure to fill in all fields."})
                    return
                }

                this.$emit("submitEvent")
                this.showSubmitMessage()
            } else {
                this.showErrorMessage({message: "All fields are required."})
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
                this.showSaveMessage({ message: "Your review has been saved successfully. NOTE: Saving does not count as a submission!"})
                await this.fetchPeerReview()
                this.clearFiles()
            } catch (error) {
                this.showErrorMessage({message: "Error saving peer review."})
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
                this.showErrorMessage({message: "Error unsubmitting peer review."})
            }
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return {text: option.option, value: option.id}
            })
        },
        uploadQuestionFilePath(reviewId, questionId) {
            return `/api/reviews/${reviewId}/questions/${questionId}/file`
        },
        clearFiles() {
            Object.entries(this.files).forEach(([key, _]) => {
                const name = 'fileForm' + String(key) + this.peerReview.review.id
                this.$refs[name][0].reset()
                this.files[key] = null
            })
            this.files = {}
        }
    },
}
</script>