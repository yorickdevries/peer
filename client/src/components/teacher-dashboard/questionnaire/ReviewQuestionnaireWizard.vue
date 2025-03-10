<template>
    <div>
        <b-alert :show="blockQuestionnaireEditing" variant="info"
            >Questionnaire editing is not allowed anymore since the peer review due date has already passed.</b-alert
        >
        <b-container>
            <b-card class="mb-3 mt-3" :class="{ 'disabled-view': blockQuestionnaireEditing }">
                <div class="d-flex justify-content-between">
                    <b-row class="flex-grow-1">
                        <b-col cols="3">
                            <div v-if="questionnaire === null">
                                <b-button @click="makeQuestionnaire" class="mb-3" variant="primary"
                                    >Make questionnaire</b-button
                                >
                            </div>
                            <div v-else>
                                <b-button v-b-modal="`createModal${questionnaire.id}`" variant="primary">
                                    Create new Question
                                </b-button>
                                <b-modal :id="`createModal${questionnaire.id}`" centered hide-footer class="p-0 m-0">
                                    <CreateQuestionWizard
                                        :questionnaireId="questionnaire.id"
                                        :questionNumber="nextQuestionNumber"
                                        @questionSaved="getQuestionnaire"
                                    ></CreateQuestionWizard>
                                </b-modal>
                            </div>
                        </b-col>
                        <b-col cols="6">
                            <div v-if="questionnaire && questionnaire.questions.length === 0">
                                <CopyQuestionWizard
                                    @copyQuestionSuccess="fetchData"
                                    :questionnaire="this.questionnaire"
                                    type="review"
                                />
                            </div>
                        </b-col>
                        <b-col cols="3">
                            <div v-if="questionnaire && questionnaire.questions.length === 0">
                                <div class="text-muted">
                                    Load default review evaluation questions into questionnaire
                                </div>
                                <b-input-group>
                                    <template #prepend>
                                        <b-button v-b-modal.modal-sm variant="primary">Default questions</b-button>
                                        <b-modal id="modal-sm" size="sm" title="Graded Defaults" @ok="defaultQuestions"
                                            >Would you like to import graded defaults?
                                            <b-form-checkbox
                                                id="graded-defaults"
                                                v-model="gradedDefault"
                                                name="graded-defaults"
                                            >
                                                Use graded questions
                                            </b-form-checkbox>
                                        </b-modal>
                                    </template>
                                </b-input-group>
                            </div>
                        </b-col>
                    </b-row>
                </div>
            </b-card>
            <!--Render questions-->
            <b-row v-if="questionnaire">
                <b-col>
                    <!--Question Information-->
                    <b-card v-for="question in questionnaire.questions" :key="question.id" class="mb-3" no-body>
                        <b-card-header class="d-flex align-items-center">
                            <span class="w-100"
                                >Question {{ question.number }} of {{ questionnaire.questions.length }}</span
                            >
                            <b-badge variant="primary" class="ml-2 float-right p-1"
                                >{{ question.type.toUpperCase() }} QUESTION
                            </b-badge>
                            <b-badge pill v-if="question.optional" variant="secondary" class="ml-2 float-right p-1">
                                OPTIONAL
                            </b-badge>
                            <b-badge v-else variant="danger" class="ml-2 float-right p-1"> REQUIRED </b-badge>
                            <b-badge v-if="question.graded" variant="secondary" class="ml-2 float-right p-1">
                                GRADED
                            </b-badge>
                            <div
                                v-if="
                                    question.type === 'open' &&
                                    (question.minWordCount !== 1 || question.maxWordCount !== 10000)
                                "
                                class="d-flex flex-row"
                            >
                                <b-badge variant="secondary" class="ml-2 p-1">
                                    MIN WORDCOUNT: {{ question.minWordCount }}
                                </b-badge>

                                <b-badge variant="secondary" class="ml-2 p-1">
                                    MAX WORDCOUNT: {{ question.maxWordCount }}
                                </b-badge>
                            </div>
                        </b-card-header>

                        <b-card-body>
                            <!-- Text-->
                            <h4>{{ question.text }}</h4>

                            <!-- OPEN QUESTION -->
                            <b-form-textarea
                                v-if="question.type === 'open'"
                                placeholder="Enter your answer"
                                :rows="10"
                                :max-rows="15"
                                readonly
                                required
                            />

                            <!-- MULTIPLE CHOICE QUESTION -->
                            <b-form-radio-group v-if="question.type === 'multiplechoice'" stacked required disabled>
                                <b-form-radio v-for="option in question.options" :key="option.id" :value="option">
                                    {{ option.text }}
                                    <b-badge v-if="question.graded" variant="dark"
                                        >Points: {{ pointsDisplay(option.points) }}</b-badge
                                    >
                                </b-form-radio>
                            </b-form-radio-group>

                            <!-- CHECKBOX QUESTION -->
                            <b-form-checkbox-group v-if="question.type === 'checkbox'" stacked required disabled>
                                <b-form-checkbox v-for="option in question.options" :key="option.id" :value="option">
                                    {{ option.text }}
                                    <b-badge v-if="question.graded" variant="dark"
                                        >Points: {{ pointsDisplay(option.points) }}</b-badge
                                    >
                                </b-form-checkbox>
                            </b-form-checkbox-group>

                            <!-- RANGE QUESTION -->
                            <StarRating
                                v-if="question.type === 'range'"
                                class="align-middle"
                                :class="{ 'disabled-view': blockQuestionnaireEditing }"
                                :border-color="'#007bff'"
                                :active-color="'#007bff'"
                                :border-width="2"
                                :item-size="20"
                                :spacing="5"
                                inline
                                :rating="question.range"
                                :max-rating="question.range"
                                :show-rating="true"
                                read-only
                            />

                            <!-- UPLOAD QUESTION -->
                            <b-form-group
                                v-if="question.type === 'upload'"
                                class="mb-0"
                                :class="{ 'disabled-view': blockQuestionnaireEditing }"
                            >
                                <b-alert show variant="warning" class="p-2">
                                    Currently, no file has been uploaded. <br />
                                    Allowed file types: {{ question.extensions }}
                                </b-alert>
                                <b-form-file placeholder="Choose a new file..." disabled> </b-form-file>
                            </b-form-group>

                            <!-- Edit button-->
                            <br />
                            <b-button
                                :disabled="blockQuestionnaireEditing && !isOptionQuestion(question.type)"
                                v-b-modal="`editModal${question.id}`"
                                variant="primary float-right"
                            >
                                {{
                                    blockQuestionnaireEditing
                                        ? question.graded
                                            ? "Edit Points"
                                            : "Edit Question"
                                        : "Edit/Delete Question"
                                }}
                            </b-button>
                            <b-modal :id="`editModal${question.id}`" centered hide-footer class="p-0 m-0">
                                <EditQuestionPointsWizard
                                    v-if="blockQuestionnaireEditing"
                                    :question="question"
                                    @questionSaved="getQuestionnaire"
                                ></EditQuestionPointsWizard>
                                <EditQuestionWizard
                                    v-else
                                    :question="question"
                                    @questionSaved="getQuestionnaire"
                                ></EditQuestionWizard>
                            </b-modal>
                        </b-card-body>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api"
import notifications from "../../../mixins/notifications"
import _ from "lodash"
import CreateQuestionWizard from "./CreateQuestionWizard"
import EditQuestionWizard from "./EditQuestionWizard"
import EditQuestionPointsWizard from "./EditQuestionPointsWizard"
import { StarRating } from "vue-rate-it"
import CopyQuestionWizard from "@/components/teacher-dashboard/questionnaire/CopyQuestionWizard"

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    components: {
        CopyQuestionWizard,
        CreateQuestionWizard,
        EditQuestionWizard,
        EditQuestionPointsWizard,
        StarRating,
    },
    data() {
        return {
            assignment: null,
            assignmentVersion: null,
            questionnaire: null,
            // enables copying of a questonnaire to another
            allQuestionnairesOfCourse: [],
            questionnaireIdToCopyFrom: null,
            gradedDefault: false,
        }
    },
    computed: {
        blockQuestionnaireEditing() {
            // block edit in case the reviews have already been published
            if (this.assignment) {
                return this.assignment.state === "feedback"
            } else {
                return true
            }
        },
        nextQuestionNumber() {
            if (this.questionnaire) {
                const maxQuestion = _.maxBy(this.questionnaire.questions, "number")
                if (maxQuestion) {
                    return maxQuestion.number + 1
                }
            }
            // in case of no questions yet
            return 1
        },
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.getAssignment()
            await this.getAssignmentVersion()
            await this.getQuestionnaire()
        },
        isOptionQuestion(questionType) {
            return questionType === "multiplechoice" || questionType === "checkbox"
        },
        pointsDisplay(points) {
            return points / 100
        },
        async getAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async getAssignmentVersion() {
            const res = await api.assignmentversions.get(this.assignmentVersionId)
            this.assignmentVersion = res.data
        },
        async getQuestionnaire() {
            if (this.assignmentVersion.reviewQuestionnaireId) {
                const res = await api.reviewquestionnaires.get(this.assignmentVersion.reviewQuestionnaireId)
                this.questionnaire = res.data
            } else {
                this.questionnaire = null
            }
        },
        async makeQuestionnaire() {
            await api.reviewquestionnaires.post(this.assignmentVersion.id)
            this.showSuccessMessage({ message: "Questionnaire made, you can now add questions." })
            await this.fetchData()
        },
        async defaultQuestions() {
            await api.reviewquestionnaires.defaultQuestions(this.questionnaire.id, Boolean(this.gradedDefault))
            this.showSuccessMessage({ message: "succesfully loaded default questions" })
            await this.fetchData()
        },
    },
}
</script>
