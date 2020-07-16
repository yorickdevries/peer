<template>
    <div>
        <!--Notification whether evaluation is submitted or not.-->
        <div v-if="evaluationExists">
            <b-alert variant="success" :show="evaluation.review.done">
                This evaluation has been submitted.
            </b-alert>
            <b-alert variant="danger" :show="!evaluation.review.done">
                This evaluation has not yet been submitted.
            </b-alert>
        </div>

        <!--Notification if owner-->
        <div v-if="evaluationExists">
            <b-alert variant="secondary" :show="isEvaluationOwner">
                You are the owner of this evaluation. You can edit/save/submit this evaluation.
            </b-alert>
        </div>

        <!--Notification is not owner-->
        <div v-if="evaluationExists">
            <b-alert variant="secondary" :show="!isEvaluationOwner">
                Another group member ({{ evaluation_meta_data.user_netid }}) is the owner of this evaluation. Only they
                can edit, save or submit this evaluation.
            </b-alert>
        </div>

        <!--See Peer Review-->
        <div v-if="review.review.id">
            <b-row>
                <b-col>
                    <b-button
                        v-b-modal="`modal_${review.review.id}`"
                        variant="success"
                        class="w-100"
                        style="height: 3rem"
                    >
                        Open Review
                    </b-button>
                </b-col>
            </b-row>

            <b-modal title="Peer Review" :id="`modal_${review.review.id}`" size="lg" hide-footer>
                <b-alert variant="info" show>
                    This is a review you have received from one of your peers on your submission.
                </b-alert>
                <PeerReview :reviewId="review.review.id" :readOnly="true"></PeerReview>
            </b-modal>
        </div>

        <!--Button/info if no evaluation exists yet.-->
        <div v-if="!evaluationExists" class="mt-3">
            <b-alert show variant="info">
                You can give an evaluation of a review that you have received by clicking the button down below. Note:
                if you are in a group, only 1 group member can evaluate this review.
                <div>
                    <b-button @click="createEvaluationButton()" variant="primary" class="mt-2">
                        I want to evaluate this review
                    </b-button>
                </div>
            </b-alert>
        </div>

        <!--Evaluation Rubric-->
        <b-card v-if="evaluationExists" no-body class="mt-3">
            <!--Title-->
            <b-card-body>
                <h4>Review Evaluation</h4>
                <h6 class="card-subtitle text-muted">
                    Evaluate the review you have gotten from one of your peers here.
                </h6>
            </b-card-body>

            <!--Form-->
            <b-list-group flush>
                <!--Questions-->
                <b-list-group-item
                    class="py-4"
                    v-for="pair in evaluationSorted.form"
                    :key="pair.question.id + pair.question.type_question"
                >
                    <!--Question Information-->
                    <div class="mb-2">
                        <h5 class="text-primary">
                            Question {{ pair.question.question_number }} of {{ evaluation.form.length }}
                        </h5>
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
                        :readonly="evaluation.review.done || !isEvaluationOwner"
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
                        :read-only="evaluation.review.done || !isEvaluationOwner"
                        v-model="pair.answer.answer"
                    />

                    <!-- MPC QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'mc'">
                        <b-form-radio-group
                            :options="transformOptionsToHTMLOptions(pair.question.option)"
                            v-model="pair.answer.answer"
                            stacked
                            required
                            :disabled="evaluation.review.done || !isEvaluationOwner"
                        ></b-form-radio-group>
                    </b-form-group>

                    <!--CHECKBOX QUESTION -->
                    <b-form-group v-else-if="pair.question.type_question === 'checkbox'">
                        <b-form-checkbox-group
                            :options="transformOptionsToHTMLOptions(pair.question.option)"
                            v-model="pair.answer.answer"
                            stacked
                            required
                            :disabled="evaluation.review.done || !isEvaluationOwner"
                        ></b-form-checkbox-group>
                    </b-form-group>

                    <!-- UPLOAD QUESTION -->
                    <div v-if="pair.question.type_question === 'upload'">
                        <!--File upload-->
                        <b-form-group
                            :description="
                                isEvaluationOwner
                                    ? ''
                                    : 'Select a file and press save down below the page. Note: it overwrites files.'
                            "
                            class="mb-0"
                        >
                            <!--Show currently uploaded file-->
                            <b-alert class="d-flex justify-content-between flex-wrap" show variant="secondary">
                                <!--Buttons for toggling new assignment upload-->
                                <div>
                                    <div v-if="pair.answer.answer">
                                        File uploaded:
                                        <a :href="uploadQuestionFilePath(evaluation.review.id, pair.question.id)">
                                            {{ pair.answer.answer }}
                                        </a>
                                    </div>
                                    <div v-else>You currently have no file uploaded.</div>
                                </div>
                            </b-alert>

                            <div v-if="isEvaluationOwner">
                                <b-alert show variant="danger">
                                    {{ pair.question.extension.toUpperCase() }} files allowed only.
                                </b-alert>

                                <b-alert v-if="pair.answer.answer" show variant="warning">
                                    Note: uploading a new file will overwrite your current file.
                                </b-alert>

                                <b-form-file
                                    placeholder="Choose a new file..."
                                    v-model="files[pair.question.id]"
                                    :state="Boolean(files[pair.question.id])"
                                    :accept="`.${pair.question.extension}`"
                                    :disabled="evaluation.review.done || !isEvaluationOwner"
                                    :ref="'fileForm' + pair.question.id + evaluation.review.id"
                                ></b-form-file>
                            </div>
                        </b-form-group>
                    </div>
                </b-list-group-item>
            </b-list-group>

            <SessionCheck ref="sessionCheck"></SessionCheck>

            <template v-if="evaluation.review.id !== null && isEvaluationOwner">
                <!--Save/Submit Buttons-->
                <b-card-body v-if="!evaluation.review.done">
                    <b-btn type="submit" variant="success float-right" v-b-modal="`submit${evaluation.review.id}`"
                        >Submit Evaluation</b-btn
                    >
                    <b-button variant="secondary float-right mr-2" @click="saveEvaluation">Save Evaluation</b-button>
                    <!--Submit Modal-->
                    <b-modal :id="`submit${evaluation.review.id}`" title="Submit Confirmation" @ok="submitEvaluation">
                        Do you really want to submit? This marks the evaluation as finished.
                    </b-modal>
                </b-card-body>
                <b-card-body v-else>
                    <b-button variant="outline-success float-right" @click="unSubmitEvaluation">
                        Unsubmit Evaluation
                    </b-button>
                </b-card-body>
            </template>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api_old"
import { StarRating } from "vue-rate-it"
import notifications from "../../../mixins/notifications"
import PeerReview from "./PeerReview"
import SessionCheck from "../../general/SessionCheck"

export default {
    mixins: [notifications],
    components: { PeerReview, StarRating, SessionCheck },
    props: ["reviewId"],
    data() {
        return {
            review: {
                review: {},
                form: {}
            },
            evaluation: {
                review: {},
                form: {}
            },
            evaluation_meta_data: {
                user_netid: ""
            },
            isEvaluationOwner: false,
            files: {}
        }
    },
    computed: {
        evaluationExists() {
            return !!(this.evaluation && this.evaluation.review && this.evaluation.review.id)
        },
        evaluationSorted() {
            // Returns the evaluation object, but sorted on question number.
            return {
                review: this.evaluation.review,
                form: this.evaluation.form.slice().sort((a, b) => {
                    return a.question.question_number - b.question.question_number
                })
            }
        }
    },
    async created() {
        // Retrieve the review.
        await this.fetchReview()

        // Retrieve the evaluation.
        await this.fetchEvaluation()
    },
    methods: {
        async createEvaluation() {
            try {
                await api.ReviewEvaluation.create(this.review.review.id)
            } catch (e) {
                this.showErrorMessage({
                    message:
                        "A group member has already evaluated this review. Only 1 group member can evaluate a review."
                })
            }
        },
        async fetchEvaluation() {
            // Fetch evaluation meta_data.
            let evaluation_id
            let evaluation_owner_net_id
            try {
                const res = await api.ReviewEvaluation.get(this.review.review.id, true)
                evaluation_owner_net_id = res.data.user_netid
                evaluation_id = res.data.id
                this.evaluation_meta_data.user_netid = evaluation_owner_net_id
            } catch (e) {
                console.log(e)
                // Normal behaviour: always returnss 401 when evaluation has not yet been created.
                // -> will render button to create an evaluation
                return
            }

            // Fetch evaluation.
            try {
                const res = await api.getPeerReview(evaluation_id)
                this.evaluation = res.data
            } catch (e) {
                this.showErrorMessage({ message: "Could not fetch the evaluation." })
                return
            }

            // Fetch user.
            let net_id
            try {
                const res = await api.getUser()
                net_id = res.data.user.netid
            } catch (e) {
                this.showErrorMessage({ message: "Could not fetch the user." })
                return
            }

            // Check whether user is owner of evaluation.
            this.isEvaluationOwner = net_id === evaluation_owner_net_id
        },
        async fetchReview() {
            // Retrieve the review.
            try {
                const res = await api.getPeerReview(this.reviewId)
                this.review = res.data
            } catch (e) {
                this.showErrorMessage({ message: "Review could not be fetched." })
            }
        },
        async createEvaluationButton() {
            await this.createEvaluation()
            await this.fetchEvaluation()
        },
        uploadQuestionFilePath(reviewId, questionId) {
            return `/api/reviews/${reviewId}/questions/${questionId}/file`
        },
        clearFiles() {
            // eslint-disable-next-line
            Object.entries(this.files).forEach(([key, _]) => {
                const name = "fileForm" + String(key) + this.evaluation.review.id
                this.$refs[name][0].reset()
                this.files[key] = null
            })
            this.files = {}
        },
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
        async unSubmitEvaluation() {
            // unSubmit peer review.
            try {
                await api.unSubmitPeerReview(this.evaluation)
                await this.fetchEvaluation()
                this.showUnSubmitMessage()
            } catch (error) {
                this.showErrorMessage({ message: "Error unsubmitting evaluation." })
            }
        },
        async submitEvaluation() {
            // Validate all fields (required).
            let validated = true
            this.evaluation.form.forEach(pair => {
                if (pair.answer.answer === null || pair.answer.answer === undefined || pair.answer.answer === "") {
                    if (pair.question.type_question === "upload") {
                        return
                    }
                    validated = false
                }
            })

            // Give validation error/success based on validation.
            if (validated) {
                // Save the evaluation.
                await this.saveEvaluation()

                // Submit evaluation.
                await api.submitPeerReview(this.evaluation)
                await this.fetchEvaluation()
                this.showSubmitMessage()
            } else {
                this.showErrorMessage({ message: "All fields are required." })
            }
        },
        async saveEvaluation() {
            // Session check.
            const inSession = await this.$refs.sessionCheck.sessionGuardCheck()
            if (!inSession) {
                return
            }

            // Set up the form data (files in ROOT of formData) to send to server.
            const formData = new FormData()
            formData.append("review", JSON.stringify(this.evaluation.review))
            formData.append("form", JSON.stringify(this.evaluation.form))
            Object.entries(this.files).forEach(([key, value]) => formData.append(key, value))

            try {
                await api.savePeerReview(this.evaluation.review.id, formData)
                this.showSaveMessage({ message: "Your review evaluation has been saved successfully." })
            } catch (error) {
                this.showErrorMessage({ message: "Error saving evaluation." })
            }
            await this.fetchEvaluation()
            this.clearFiles()
        }
    }
}
</script>
