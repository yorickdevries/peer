<template>
    <div>
        <b-alert :show="blockQuestionnaireEditing" variant="info"
            >Questionnaire editing is not allowed anymore since the peer review publish date has already
            passed.</b-alert
        >
        <b-container v-bind:class="{ 'disabled-view': blockQuestionnaireEditing }">
            <b-card class="mb-3 mt-3">
                <div class="d-flex justify-content-between">
                    <div v-if="questionnaire === null">
                        <b-button @click="makeQuestionnaire" class="mb-3" variant="primary"
                            >Make questionnaire</b-button
                        >
                    </div>
                    <div v-if="questionnaire">
                        <b-button v-b-modal="'createModal'" variant="primary">
                            Create new Question
                        </b-button>
                        <b-modal id="createModal" centered hide-footer class="p-0 m-0">
                            <CreateQuestionWizard
                                :questionnaireId="questionnaire.id"
                                :questionNumber="nextQuestionNumber"
                                @questionSaved="getQuestionnaire"
                            ></CreateQuestionWizard>
                        </b-modal>
                    </div>
                    <div v-if="questionnaire && questionnaire.questions.length === 0">
                        <div class="text-muted">Copy questions from another questionnaire</div>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <b-button variant="primary" @click="copyQuestionnaire">Copy</b-button>
                            </div>
                            <b-form-select v-model="questionnaireIdToCopyFrom">
                                <b-form-select-option
                                    v-for="questionnaire in allQuestionnairesOfCourse"
                                    :key="questionnaire.id"
                                    :value="questionnaire.id"
                                    >{{ questionnaire.name }}</b-form-select-option
                                >
                            </b-form-select>
                        </div>
                    </div>
                </div>
            </b-card>
            <!--Render questions-->
            <b-row v-if="questionnaire">
                <b-col>
                    <b-card v-for="question in questionnaire.questions" :key="question.id" class="mb-3" no-body>
                        <b-card-header class="d-flex align-items-center">
                            <span class="w-100">Question {{ question.number }}</span>
                            <b-badge variant="primary" class="ml-2 float-right p-1"
                                >{{ question.type.toUpperCase() }} QUESTION
                            </b-badge>
                            <b-badge pill v-if="question.optional" variant="secondary" class="ml-2 float-right p-1">
                                OPTIONAL
                            </b-badge>
                            <b-badge v-else variant="danger" class="ml-2 float-right p-1">
                                REQUIRED
                            </b-badge>
                        </b-card-header>

                        <b-card-body>
                            <!-- Text-->
                            <h4>{{ question.text }}</h4>
                            <!-- Options-->
                            <div v-if="question.type === 'multiplechoice'">
                                Options:
                                <div v-for="option in question.options" :key="option.id">
                                    <b-form-checkbox disabled="true">{{ option.text }}</b-form-checkbox>
                                </div>
                            </div>
                            <div v-if="question.type === 'checkbox'">
                                Options:
                                <div v-for="option in question.options" :key="option.id">
                                    <b-form-radio disabled="true">{{ option.text }}</b-form-radio>
                                </div>
                            </div>
                            <!-- Range-->
                            <div v-if="question.range">Max range: {{ question.range }}</div>
                            <!-- Allowed extensions-->
                            <div v-if="question.extensions">Allowed extensions: {{ question.extensions }}</div>
                            <!-- Edit button-->
                            <br />
                            <b-button v-b-modal="`editModal${question.id}`" variant="primary">
                                Edit/Delete Question
                            </b-button>
                            <b-modal :id="`editModal${question.id}`" centered hide-footer class="p-0 m-0">
                                <EditQuestionWizard
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

export default {
    mixins: [notifications],
    components: {
        CreateQuestionWizard,
        EditQuestionWizard
    },
    data() {
        return {
            assignment: null,
            questionnaire: null,
            // enables copying of a questonnaire to another
            allQuestionnairesOfCourse: [],
            questionnaireIdToCopyFrom: null
        }
    },
    computed: {
        blockQuestionnaireEditing() {
            // block edit in case the reviews have already been published
            if (this.assignment) {
                return new Date() > new Date(this.assignment.reviewPublishDate)
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
        }
    },
    async created() {
        await this.getAssignment()
        await this.getQuestionnaire()
        await this.getAllQuestionnairesOfCourse()
    },
    methods: {
        async getAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async getQuestionnaire() {
            if (this.assignment.submissionQuestionnaireId) {
                const res = await api.submissionquestionnaires.get(this.assignment.submissionQuestionnaireId)
                this.questionnaire = res.data
            } else {
                this.questionnaire = null
            }
        },
        async makeQuestionnaire() {
            await api.submissionquestionnaires.post(this.assignment.id)
            this.showSuccessMessage({ message: "Questionnaire made, you can now add questions." })
            await this.getAssignment()
            await this.getQuestionnaire()
        },
        async getAllQuestionnairesOfCourse() {
            const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
            const allAssignmentsOfCourse = res.data
            // iterate over assignments
            this.allQuestionnairesOfCourse = []
            for (const assignment of allAssignmentsOfCourse) {
                if (assignment.id !== this.assignment.id) {
                    if (assignment.submissionQuestionnaireId) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + " (submissionquestionnaire)",
                            id: assignment.submissionQuestionnaireId
                        })
                    }
                    if (assignment.reviewQuestionnaireId) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + " (reviewquestionnaire)",
                            id: assignment.reviewQuestionnaireId
                        })
                    }
                }
            }
        },
        async copyQuestionnaire() {
            await api.submissionquestionnaires.copyQuestions(this.questionnaire.id, this.questionnaireIdToCopyFrom)
            this.showSuccessMessage({ message: "succesfully copied over questions" })
            await this.getQuestionnaire()
        }
    }
}
</script>
