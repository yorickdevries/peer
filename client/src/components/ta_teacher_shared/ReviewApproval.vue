<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle
                :items="['Assignments', assignment.title, 'Reviews', peerReview.review.id]"
                class="mt-3"
            ></BreadcrumbTitle>

            <!--Next Review-->
            <b-card no-body>
                <b-card-header class="d-flex justify-content-between align-items-center">
                    <div>Review information</div>
                    <div>
                        <b-button size="sm" variant="secondary" @click="backToReviewList" class="mr-2"
                            >Back to Assignment</b-button
                        >
                        <b-button size="sm" variant="primary" @click="goToNextReview">Next (Random) Review</b-button>
                    </div>
                </b-card-header>
                <b-card-body>
                    <b-row>
                        <!--Download-->
                        <b-col cols="6">
                            <div>
                                <dl>
                                    <dt>Download</dt>
                                    <dd>The download for the submission this review is about.</dd>
                                    <a target="_blank" :href="peerReviewFilePath">
                                        <button type="button" class="btn btn-success success">
                                            Download Submission
                                        </button>
                                    </a>
                                </dl>
                            </div>
                        </b-col>

                        <!--Approval-->
                        <b-col cols="6">
                            <div>
                                <dl>
                                    <dt>Current approval status</dt>
                                    <dd v-if="peerReview.review.approved">Approved</dd>
                                    <dd v-if="peerReview.review.approved === false">Disapproved</dd>
                                    <dd v-if="peerReview.review.approved === null || peerReview.undefined">
                                        No action yet by any TA.
                                    </dd>
                                    <dd><small>(You can change this on the bottom of the page)</small></dd>
                                </dl>
                            </div>
                        </b-col>
                    </b-row>
                </b-card-body>
            </b-card>

            <b-card no-body class="mt-3">
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
                            <b-badge
                                pill
                                v-if="pair.question.optional"
                                variant="secondary"
                                class="ml-2 float-right p-1"
                            >
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
                            :readonly="true"
                            required
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
                            :read-only="true"
                            v-model="pair.answer.answer"
                        />

                        <!-- MPC QUESTION -->
                        <b-form-group v-else-if="pair.question.type_question === 'mc'">
                            <b-form-radio-group
                                :options="transformOptionsToHTMLOptions(pair.question.option)"
                                v-model="pair.answer.answer"
                                stacked
                                required
                                :disabled="true"
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
                                :disabled="true"
                            >
                            </b-form-checkbox-group>
                        </b-form-group>

                        <!-- UPLOAD QUESTION -->
                        <template v-if="pair.question.type_question === 'upload'">
                            <b-alert class="d-flex justify-content-between flex-wrap" show variant="secondary">
                                <!--Buttons for toggling new assignment upload-->
                                <div>
                                    <div v-if="pair.answer.answer">
                                        File uploaded:
                                        <a :href="uploadQuestionFilePath(peerReview.review.id, pair.question.id)">
                                            {{ pair.answer.answer }}
                                        </a>
                                    </div>
                                    <div v-else>No file has been uploaded.</div>
                                </div>
                            </b-alert>
                        </template>
                    </b-list-group-item>
                </b-list-group>
            </b-card>

            <b-card class="mt-3">
                <!--Approval-->
                <div>
                    <dl>
                        <dt>Current approval status</dt>
                        <dd v-if="peerReview.review.approved">Approved</dd>
                        <dd v-if="peerReview.review.approved === false">Disapproved</dd>
                        <dd v-if="peerReview.review.approved === null || peerReview.undefined">
                            No action yet by any TA.
                        </dd>
                        <dd>
                            <b-button
                                variant="danger"
                                class="mr-2"
                                @click="disapprove"
                                :disabled="peerReview.review.approved === false"
                            >
                                Disapprove 👎
                            </b-button>
                            <b-button variant="success" @click="approve" :disabled="peerReview.review.approved">
                                Approve 👍
                            </b-button>
                        </dd>
                    </dl>
                </div>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import api from "../../api_old"
import notifications from "../../mixins/notifications"
import BreadcrumbTitle from "../BreadcrumbTitle"
import { StarRating } from "vue-rate-it"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle, StarRating },
    data() {
        return {
            peerReview: {
                review: {
                    id: null,
                    rubric_id: null,
                    file_path: "",
                    comment: null,
                    done: null,
                    approved: null
                },
                form: []
            },
            assignment: {
                title: ""
            }
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
            return this.peerReview.form.length
        },
        peerReviewFilePath() {
            // Get the submission file path.
            return `/api/reviews/${this.peerReview.review.id}/file`
        }
    },
    async created() {
        // Load review.
        try {
            const { data: peerReview } = await api.getPeerReview(this.$route.params.reviewId)
            this.peerReview = peerReview
        } catch (e) {
            this.showErrorMessage({ message: "Review could not be loaded." })
        }

        // Load assignment info.
        try {
            const rubric = (await api.getRubric(this.peerReview.review.rubric_id)).data
            const { data: assignment } = await api.getAssignment(rubric.assignment_id)
            this.assignment = assignment
        } catch (e) {
            this.showErrorMessage()
        }
    },
    methods: {
        transformOptionsToHTMLOptions(options) {
            // Transforms the option array from the API to a HTML option array.
            return options.map(option => {
                return { text: option.option, value: option.id }
            })
        },
        async disapprove() {
            this.peerReview.review.approved = false
            await this.updateApproval()
        },
        async approve() {
            this.peerReview.review.approved = true
            await this.updateApproval()
        },
        async updateApproval() {
            try {
                await api.client.post(`/reviews/${this.peerReview.review.id}/grade`, {
                    approved: this.peerReview.review.approved
                })
                this.showSuccessMessage({ message: "Review approval status changed" })
            } catch (e) {
                this.showErrorMessage({ message: "Something went wrong with approving/disapproving this review" })
            }
        },
        async goToNextReview() {
            try {
                const { data } = await api.client.get(`assignments/${this.assignment.id}/randomReview`)
                const randomId = data.id
                this.$router.push({ name: this.$router.currentRoute.name, params: { reviewId: randomId } })
                location.reload()
            } catch (e) {
                this.showErrorMessage({ message: "All reviews have been reviewed already!" })
            }
        },
        backToReviewList() {
            console.log(this.$router.currentRoute)
            if (this.$router.currentRoute.name.includes("teacher")) {
                this.$router.push({
                    name: "teacher-dashboard.assignments.assignment",
                    params: { assignmentId: this.assignment.id }
                })
            } else {
                this.$router.push({
                    name: "teaching-assistant-dashboard.course.assignment",
                    params: { assignmentId: this.assignment.id }
                })
            }
        },
        uploadQuestionFilePath(reviewId, questionId) {
            return `/api/reviews/${reviewId}/questions/${questionId}/file`
        }
    }
}
</script>
