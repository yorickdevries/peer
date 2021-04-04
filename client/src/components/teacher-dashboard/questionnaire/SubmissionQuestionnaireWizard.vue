<template>
    <div>
        <b-alert :show="blockQuestionnaireEditing" variant="info"
            >Questionnaire editing is not allowed anymore since the peer review publish date has already
            passed.</b-alert
        >
        <b-container v-bind:class="{ 'disabled-view': blockQuestionnaireEditing }">
            <b-card class="mb-3 mt-3">
                <div class="d-flex justify-content-between">
                    <b-row>
                        <b-col>
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
                        <b-col>
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
                            <b-badge v-else variant="danger" class="ml-2 float-right p-1">
                                REQUIRED
                            </b-badge>
                            <b-badge v-if="question.graded" variant="secondary" class="ml-2 float-right p-1">
                                GRADED
                            </b-badge>
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
                                        >Points: {{ option.points || 0 }}</b-badge
                                    >
                                </b-form-radio>
                            </b-form-radio-group>

                            <!-- CHECKBOX QUESTION -->
                            <b-form-checkbox-group v-if="question.type === 'checkbox'" stacked required disabled>
                                <b-form-checkbox v-for="option in question.options" :key="option.id" :value="option">
                                    {{ option.text }}
                                    <b-badge v-if="question.graded" variant="dark"
                                        >Points: {{ option.points || 0 }}</b-badge
                                    >
                                </b-form-checkbox>
                            </b-form-checkbox-group>

                            <!-- RANGE QUESTION -->
                            <StarRating
                                v-if="question.type === 'range'"
                                class="align-middle"
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
                            <b-form-group v-if="question.type === 'upload'" class="mb-0">
                                <b-alert show variant="warning" class="p-2">
                                    Currently, no file has been uploaded. <br />
                                    Allowed file types: {{ question.extensions }}
                                </b-alert>
                                <b-form-file placeholder="Choose a new file..." disabled> </b-form-file>
                            </b-form-group>

                            <!-- Edit button-->
                            <br />
                            <b-button v-b-modal="`editModal${question.id}`" variant="primary float-right">
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
import { StarRating } from "vue-rate-it"

export default {
    props: ["assignmentVersionId"],
    mixins: [notifications],
    components: {
        CreateQuestionWizard,
        EditQuestionWizard,
        StarRating
    },
    data() {
        return {
            assignment: null,
            assignmentVersion: null,
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
                return this.assignment.state === "review" || this.assignment.state === "feedback"
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
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.getAssignment()
            await this.getAssignmentVersion()
            await this.getQuestionnaire()
            await this.getAllQuestionnairesOfCourse()
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
            if (this.assignmentVersion.submissionQuestionnaireId) {
                const res = await api.submissionquestionnaires.get(this.assignmentVersion.submissionQuestionnaireId)
                this.questionnaire = res.data
            } else {
                this.questionnaire = null
            }
        },
        async makeQuestionnaire() {
            await api.submissionquestionnaires.post(this.assignmentVersion.id)
            this.showSuccessMessage({ message: "Questionnaire made, you can now add questions." })
            await this.fetchData()
        },
        async getAllQuestionnairesOfCourse() {
            const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
            const allAssignmentsOfCourse = res.data
            // iterate over assignments
            this.allQuestionnairesOfCourse = []
            for (const assignment of allAssignmentsOfCourse) {
                for (const assignmentVersion of assignment.versions) {
                    if (
                        assignmentVersion.submissionQuestionnaireId &&
                        assignmentVersion.submissionQuestionnaireId !== this.questionnaire.id
                    ) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + "-" + assignmentVersion.name + " (submissionquestionnaire)",
                            id: assignmentVersion.submissionQuestionnaireId
                        })
                    }
                    if (
                        assignmentVersion.reviewQuestionnaireId &&
                        assignmentVersion.reviewQuestionnaireId !== this.questionnaire.id
                    ) {
                        this.allQuestionnairesOfCourse.push({
                            name: assignment.name + "-" + assignmentVersion.name + " (reviewquestionnaire)",
                            id: assignmentVersion.reviewQuestionnaireId
                        })
                    }
                }
            }
        },
        async copyQuestionnaire() {
            await api.submissionquestionnaires.copyQuestions(this.questionnaire.id, this.questionnaireIdToCopyFrom)
            this.showSuccessMessage({ message: "succesfully copied over questions" })
            await this.fetchData()
        }
    }
}
</script>
