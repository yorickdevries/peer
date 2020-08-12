<template>
    <div>
        <b-alert :show="blockRubricEditing" variant="info"
            >Rubric editing is not allowed anymore since the peer review publish date has already passed.</b-alert
        >

        <b-container v-bind:class="{ 'disabled-view': blockRubricEditing }">
            <b-card class="mb-3 mt-3">
                <div class="d-flex justify-content-between">
                    <div>
                        <div class="text-muted">Make Rubric</div>
                        <b-button @click="makeRubric()" class="mb-3" variant="primary">
                            Make rubric
                        </b-button>
                    </div>
                    <div>
                        <div class="text-muted">Create a new question</div>
                        <b-button v-b-modal="'createModal'" variant="primary">
                            Create new Question
                        </b-button>
                    </div>
                    <div>
                        <div class="text-muted">Copy questions from another rubric</div>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <b-button variant="primary" @click="copyRubric">Copy</b-button>
                            </div>
                            <b-form-select
                                v-model="assignmentIdSubmissionRubricToCopy"
                                :options="assignmentsMetaData"
                                plain
                            ></b-form-select>
                        </div>
                    </div>
                </div>
            </b-card>

            <b-row>
                <b-col>
                    <b-card
                        v-for="(question, index) in rubric.questions"
                        :key="`${question.id}-${question.type}`"
                        class="mb-3"
                        no-body
                    >
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
                            <template v-if="question.type === 'open'">
                                <OpenQuestion v-model="rubric.questions[index]"></OpenQuestion>
                            </template>

                            <template v-if="question.type === 'range'">
                                <RangeQuestion v-model="rubric.questions[index]"></RangeQuestion>
                            </template>

                            <template v-if="question.type === 'multiplechoice'">
                                <MCQuestion v-model="rubric.questions[index]"></MCQuestion>
                            </template>

                            <template v-if="question.type === 'checkbox'">
                                <CheckboxQuestion v-model="rubric.questions[index]"></CheckboxQuestion>
                            </template>

                            <template v-if="question.type === 'upload'">
                                <UploadQuestion v-model="rubric.questions[index]"></UploadQuestion>
                            </template>

                            <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">
                                Save
                            </b-button>

                            <!--<b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete</b-button>-->

                            <span>
                                <b-btn v-b-modal="`delete${question.id}`" variant="outline-danger" size="sm"
                                    >Delete</b-btn
                                >
                                <b-modal
                                    :id="`delete${question.id}`"
                                    centered
                                    title="Warning"
                                    @ok="deleteQuestion(question)"
                                >
                                    Are you sure you want to delete? <br /><br />
                                    Deleting a question after students have submitted answers to this question will
                                    DELETE all the answers the students have given.
                                </b-modal>
                            </span>
                        </b-card-body>
                    </b-card>

                    <b-modal id="deleteModal" centered title="Warning" @ok="deleteQuestion(question)">
                        Are you sure you want to delete? Deleting a question after students have submitted answers to
                        this question will DELETE all the answers the students have given.
                    </b-modal>

                    <b-modal id="createModal" centered hide-header hide-footer class="p-0 m-0">
                        <CreateQuestionWizard
                            :rubricId="rubric.id"
                            :nextNewQuestionNumber="nextNewQuestionNumber"
                            @saved="fetchRubric"
                        ></CreateQuestionWizard>
                    </b-modal>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import api from "../../../api/api_temp"
import notifications from "../../../mixins/notifications"
import OpenQuestion from "./OpenQuestion"
import RangeQuestion from "./RangeQuestion"
import MCQuestion from "./MCQuestion"
import CheckboxQuestion from "./CheckboxQuestion"
import UploadQuestion from "./UploadQuestion"
import CreateQuestionWizard from "./CreateQuestionWizard"

let apiPrefixes = {
    open: "/openquestions",
    range: "/rangequestions",
    multiplechoice: "/multiplechoicequestions",
    multiplechoiceoption: "/multiplechoicequestionoptions",
    checkbox: "/checkboxquestions",
    checkboxoption: "/checkboxquestionoptions",
    upload: "/uploadquestions"
}

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CheckboxQuestion,
        CreateQuestionWizard,
        UploadQuestion
    },
    props: ["assignmentId", "reviewPublishDate"],
    data() {
        return {
            rubric: {
                id: null,
                assignmentId: null,
                type: null,
                questions: [],
                createdAt: null,
                updatedAt: null
            },
            assignmentsMetaData: [],
            assignmentIdSubmissionRubricToCopy: null
        }
    },
    computed: {
        blockRubricEditing() {
            return new Date() > new Date(this.reviewPublishDate)
        },
        nextNewQuestionNumber() {
            if (this.rubric.questions === undefined || this.rubric.questions.length === 0) {
                return 1
            } else {
                // Get max question number.
                let max = 1
                this.rubric.questions.forEach(question => {
                    if (question.number > max) {
                        max = question.number
                    }
                })
                return max + 1
            }
        }
    },
    async created() {
        await this.fetchRubric()
        await this.fetchCourseRubricMetaData()
    },
    methods: {
        async fetchRubric() {
            let assignment = await api.getAssignment(this.assignmentId)
            let submissionQuestionnaireId = assignment.data.submissionQuestionnaireId
            let res = await api.getSubmissionQuestionnaire(submissionQuestionnaireId)
            this.rubric = res.data
            this.rubric.questions.sort((a, b) => a.number - b.number)
        },
        async fetchCourseRubricMetaData() {
            const { data } = await api.getCourseAssignments(this.$route.params.courseId)
            this.assignmentsMetaData = data.map(assignment => {
                return { value: assignment.id, text: assignment.name }
            })
        },
        async deleteQuestion(question) {
            try {
                await api.client.delete(`${apiPrefixes[question.type]}/${question.id}`)
                this.showSuccessMessage({ message: "Successfully deleted question." })
            } catch (e) {
                this.showErrorMessage({ message: e.response.data })
            }
            await this.fetchRubric()
        },
        async saveQuestion(question) {
            // Construct questionPatch object for saving information
            let questionPatch = {
                text: question.text,
                number: question.number,
                optional: question.optional
            }

            // Add range for range question
            if (question.type === "range") questionPatch.range = question.range
            // Add allowed extensions for upload question
            if (question.type === "upload") questionPatch.extensions = question.extensions
            // Special save function to save MC questions.
            if (question.type === "multiplechoice") return this.saveQuestionWithOptions(question)
            // Special save function to save Checkbox questions.
            if (question.type === "checkbox") return this.saveQuestionWithOptions(question)

            try {
                await api.client.patch(`${apiPrefixes[question.type]}/${question.id}`, questionPatch)
                this.showSuccessMessage({ message: "Successfully saved question." })
            } catch (e) {
                this.showErrorMessage({ message: e.response.data })
            }
            await this.fetchRubric()
        },
        async saveQuestionWithOptions(question) {
            try {
                let options = question.options

                // Save options first to the API (delete/post/patch).
                for (const option of options) {
                    if (option.delete === true) {
                        await api.client.delete(`${apiPrefixes[question.type + "option"]}/${option.id}`)
                    } else if (option.id === undefined) {
                        await api.client.post(`${apiPrefixes[question.type + "option"]}`, option)
                    } else if (option.id) {
                        let optionPatch = { text: option.text }
                        await api.client.patch(`${apiPrefixes[question.type + "option"]}/${option.id}`, optionPatch)
                    }
                }

                // Save question text, number and optionality.
                let questionPatch = {
                    text: question.text,
                    number: question.number,
                    optional: question.optional
                }
                await api.client.patch(`${apiPrefixes[question.type]}/${question.id}`, questionPatch)
                this.showSuccessMessage({ message: "Successfully saved question." })
                await this.fetchRubric()
            } catch (e) {
                console.log("SAVE", question.type, "ERROR:", e)
                console.log("SAVE", question.type, "ERROR:", e.response)
            }
        },
        async copyRubric() {
            if (this.assignmentIdSubmissionRubricToCopy === null)
                return this.showErrorMessage({ message: "Choose an Assignment rubric to copy first." })
            const rubricToCopy = await api.getSubmissionQuestionnaire(this.assignmentIdSubmissionRubricToCopy)
            const rubricToCopyId = rubricToCopy.data.id
            try {
                await api.copyQuestionsSubmissionQuestionnaire({ copyFromQuestionnaireId: rubricToCopyId })
                // await api.client.get(`rubric/${this.rubric.id}/copy/${rubricToCopyId}`)
                this.showSuccessMessage({ message: "Rubric successfully copied and appended to this rubric." })
            } catch (e) {
                this.showErrorMessage({ message: "Rubric could not be copied." })
            }

            await this.fetchRubric()
        },
        async makeRubric() {
            try {
                await api.createSubmissionQuestionnaire({ assignmentId: this.assignmentId })
                this.showSuccessMessage({ message: "Rubric made, you can now add questions." })
            } catch (e) {
                this.showErrorMessage({ message: e.response.data })
            }
            await this.fetchRubric()
            await this.fetchCourseRubricMetaData()
        }
    }
}
</script>
