
<template>
    <div>
    <b-alert :show="blockRubricEditing" variant="info">Rubric editing is not allowed anymore since the peer review publish date has already elapsed.</b-alert>

    <b-container v-bind:class="{ 'disabled-view': blockRubricEditing }">

        <b-card class="mb-3 mt-3">
            <div class="d-flex justify-content-between">
                <div>
                    <div class="text-muted">Make Rubric</div>
                    <b-button @click="makeRubric()" class="mb-3" variant="primary" size="sm">Make Rubric</b-button>
                </div>
                <div>
                    <div class="text-muted">Create a new question.</div>
                    <b-button v-b-modal="'createModal'"  variant="primary">Add new Question</b-button>
                </div>
                <div>
                    <div class="text-muted">Copy questions from another rubric.</div>
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <b-button variant="primary" @click="copyRubric">Copy</b-button>
                        </div>
                        <b-form-select v-model="assignmentIdSubmissionRubricToCopy" :options="assignmentsMetaData"  plain></b-form-select>
                    </div>
                </div>

                <div>
                    <div class="text-muted">Deletes all questions</div>
                    <b-button variant="danger" v-b-modal.deleteAll>Delete all questions</b-button>
                    <b-modal id="deleteAll" centered title="Warning" @ok="deleteAll">
                        Are you sure you want to delete ALL questions? Deleting a question after students have submitted
                        answers to this question will DELETE all the answers the students have given.
                    </b-modal>
                </div>
            </div>
        </b-card>

        <b-row>
            <b-col>

                <b-card v-for="(question, index) in rubric.questions"
                        :key="`${question.id}-${question.type_question}`"
                        class="mb-3"
                        no-body>

                    <b-card-header class="d-flex align-items-center">
                        <span class="w-100">Question {{ question.question_number }}</span>
                        <b-badge variant="success" class="ml-2 float-right p-1">{{
                            question.type_question.toUpperCase() }} QUESTION
                        </b-badge>
                    </b-card-header>

                    <b-card-body>
                        <template v-if="question.type_question === 'open'">
                            <OpenQuestion v-model="rubric.questions[index]"></OpenQuestion>
                        </template>

                        <template v-if="question.type_question === 'range'">
                            <RangeQuestion v-model="rubric.questions[index]"></RangeQuestion>
                        </template>

                        <template v-if="question.type_question === 'mc'">
                            <MCQuestion v-model="rubric.questions[index]"></MCQuestion>
                        </template>

                        <template v-if="question.type_question === 'upload'">
                            <UploadQuestion v-model="rubric.questions[index]"></UploadQuestion>
                        </template>

                        <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">
                            Save
                        </b-button>

                        <!--<b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete</b-button>-->

                        <span>
                            <b-btn v-b-modal="`delete${question.id}`" variant="outline-danger" size="sm">Delete</b-btn>
                            <b-modal :id="`delete${question.id}`" centered title="Warning" @ok="deleteQuestion(question)">
                                Are you sure you want to delete? Deleting a question after students have submitted
                                answers to this question will DELETE all the answers the students have given.
                            </b-modal>
                        </span>

                    </b-card-body>
                </b-card>

                <b-modal id="deleteModal" centered title="Warning" @ok="deleteQuestion(question)">
                    Are you sure you want to delete? Deleting a question after students have submitted
                    answers to this question will DELETE all the answers the students have given.
                </b-modal>

                <b-modal id="createModal" centered hide-header hide-footer class="p-0 m-0">
                    <CreateQuestionWizard :rubricId="rubric.id" :nextNewQuestionNumber="nextNewQuestionNumber" @saved="fetchRubric"></CreateQuestionWizard>
                </b-modal>

            </b-col>
        </b-row>
    </b-container>
    </div>

</template>

<script>
import api from "../../../api";
import notifications from '../../../mixins/notifications'
import OpenQuestion from './OpenQuestion'
import RangeQuestion from './RangeQuestion'
import MCQuestion from './MCQuestion'
import UploadQuestion from './UploadQuestion'
import CreateQuestionWizard from './CreateQuestionWizard'

let apiPrefixes = {
    open: '/rubric/openquestion',
    mc: '/rubric/mcquestion',
    range: '/rubric/rangequestion',
    mcoption: '/rubric/mcoption',
    upload: '/rubric/uploadquestion'
}

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CreateQuestionWizard,
        UploadQuestion
    },
    props: ['assignmentId', 'review_publish_date'],
    data() {
        return {
            rubric: {
                id: null,
                assignment_id: null,
                type: null,
                questions: []
            },
            assignmentsMetaData: [],
            assignmentIdSubmissionRubricToCopy: null
        }
    },
    computed: {
        blockRubricEditing() {
            return new Date() > new Date(this.review_publish_date);
        },
        nextNewQuestionNumber() {
            if (this.rubric.questions === undefined || this.rubric.questions.length === 0) {
                return 1
            } else {
                // Get max question number.
                let max = 1
                this.rubric.questions.forEach(question => {
                    if (question.question_number > max) {
                        max = question.question_number
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
            let res = await api.client.get(`rubric/submissionrubric/${this.assignmentId}`)
            this.rubric = res.data
            this.rubric.questions.sort((a, b) => a.question_number - b.question_number)
        },
        async fetchCourseRubricMetaData() {
            const {data} = await api.getCourseAssignments(this.$route.params.courseId)
            const assignmentsMetaData = data.map(assignment => {
                return {value: assignment.id, text: assignment.title}
            })
            this.assignmentsMetaData = assignmentsMetaData
        },
        async deleteQuestion(question) {
            try {
                await api.client.delete(`${apiPrefixes[question.type_question]}/${question.id}`);
                this.showSuccessMessage({message: 'Successfully deleted question.'})
            } catch (e) {
                this.showErrorMessage()
            }
            await this.fetchRubric()
        },
        async saveQuestion(question) {
            // Special save function to save MC questions.
            if (question.type_question === 'mc') return this.saveMCQuestion(question)

            await api.client.put(`${apiPrefixes[question.type_question]}/${question.id}`, question)
            this.showSuccessMessage({message: 'Successfully saved question.'})
            await this.fetchRubric()
        },
        async saveMCQuestion(question) {
            let options = question.option

            // Save options first to the API (delete/post/put).
            options.forEach(async option => {

                if (option.delete === true)
                    await api.client.delete(`${apiPrefixes['mcoption']}/${option.id}`)
                else if (option.id === undefined)
                    await api.client.post(`${apiPrefixes['mcoption']}`, option)
                else if (option.id)
                    await api.client.put(`${apiPrefixes['mcoption']}/${option.id}`, option)

            })

            // Save question text.
            await api.client.put(`${apiPrefixes[question.type_question]}/${question.id}`, question)
            this.showSuccessMessage({message: 'Successfully saved question.'})
            await this.fetchRubric()
        },
        async copyRubric() {
            if (this.assignmentIdSubmissionRubricToCopy === null) return this.showErrorMessage({message: "Choose an Assignment rubric to copy first."})
            const rubricToCopy = await api.client.get(`rubric/submissionrubric/${this.assignmentIdSubmissionRubricToCopy}`)
            const rubricToCopyId = rubricToCopy.data.id
            try {
                await api.client.get(`rubric/${this.rubric.id}/copy/${rubricToCopyId}`)
                this.showSuccessMessage({message: "Rubric successfully copied and appended to this rubric."})
            } catch (e) {
                this.showErrorMessage({message: "Rubric could not be copied."})
            }

            await this.fetchRubric()
        },
        async deleteAll() {
            try {
                await api.client.get(`rubric/${this.rubric.id}/deleteall`)
                this.showSuccessMessage({message: "Deleted all questions."})
            } catch (e) {
                this.showErrorMessage({message: "Could not delete all questions."})
            }

            await this.fetchRubric()
        },
        async makeRubric() {
            try {
                await api.client.post(`rubric/`, {assignment_id: this.assignmentId, rubric_type: 'submission'})
                this.showSuccessMessage({message: "Rubric made, you can now add questions."})
            } catch (e) {
                this.showErrorMessage({message: 'Couldn\'t make Rubric'})
            }
            await this.fetchRubric()
            await this.fetchCourseRubricMetaData()
        }
    }
}

</script>