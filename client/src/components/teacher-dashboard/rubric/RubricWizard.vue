
<template>
    <b-container>

        <b-card class="mb-3">
            <div class="d-flex justify-content-between">
                <div>
                    <div class="text-muted">Create a new question.</div>
                    <b-button v-b-modal="'createModal'"  variant="primary">Add new Question</b-button>
                </div>
                <div>
                    <div class="text-muted">Copy questions from another rubric.</div>
                    <div class="input-group mb-2">
                        <div class="input-group-prepend">
                            <b-button variant="primary">Copy</b-button>
                        </div>
                        <b-form-select v-model="rubricToCopy" :options="rubricsMetaData"  plain></b-form-select>
                    </div>
                </div>

                <div>
                    <div class="text-muted">Deletes all questions</div>
                    <b-button variant="danger">Delete all questions</b-button>
                </div>
            </div>
        </b-card>

        <b-row>
            <b-col>

                <b-card v-for="(question, index) in rubric.questions"
                        :key="question.id"
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

                        <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">
                            Save
                        </b-button>
                        <b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete
                        </b-button>
                    </b-card-body>
                </b-card>

                <b-modal id="createModal" centered hide-header hide-footer class="p-0 m-0">
                    <CreateQuestionWizard :rubricId="rubric.id" @saved="fetchRubric"></CreateQuestionWizard>
                </b-modal>

            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api";
import notifications from '../../../mixins/notifications'
import OpenQuestion from './OpenQuestion'
import RangeQuestion from './RangeQuestion'
import MCQuestion from './MCQuestion'
import CreateQuestionWizard from './CreateQuestionWizard'

let apiPrefixes = {
    open: '/rubric/openquestion',
    mc: '/rubric/mcquestion',
    range: '/rubric/rangequestion',
    mcoption: '/rubric/mcoption',
}
export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CreateQuestionWizard
    },
    props: ['rubricId'],
    data() {
        return {
            rubric: {
                id: null,
                assignment_id: null,
                question: []
            },
            rubricsMetaData: [],
            rubricToCopy: null
        }
    },
    async created() {
        await this.fetchRubric()
        await this.fetchCourseRubricMetaData()
    },
    methods: {
        async fetchRubric() {
            let res = await api.client.get(`/rubric/${this.rubricId}`)
            this.rubric = res.data
            this.rubric.questions.sort((a, b) => a.question_number - b.question_number)
        },
        async fetchCourseRubricMetaData() {
            const {data} = await api.getCourseAssignments(this.$route.params.courseId)
            const rubricsMetaData = data.map(assignment => {
                return {value: assignment.id, text: assignment.title}
            })
            console.log(rubricsMetaData)
            this.rubricsMetaData = rubricsMetaData
        },
        async deleteQuestion(question) {
            await api.client.delete(`${apiPrefixes[question.type_question]}/${question.id}`);
            this.showSuccessMessage({message: 'Successfully deleted question.'})
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
    }
}

</script>