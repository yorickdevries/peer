
<template>
    <b-container>
        <b-row>
            <b-col>

                <b-card class="mt-4" no-body>

                    <b-card-header>
                        <span>Rubric Wizard</span>
                        <b-button v-b-modal="'createModal'" size="sm" variant="outline-primary" class="float-right">Add new Question</b-button>
                    </b-card-header>

                    <b-card-body>
                    <b-card v-for="(question, index) in rubric.questions"
                            :key="question.id"
                            :header="`Question ${question.question_number} [${question.type_question.toUpperCase()}]`"
                            class="mb-3">

                            <template v-if="question.type_question === 'open'">
                                <OpenQuestion v-model="rubric.questions[index]"></OpenQuestion>
                            </template>

                            <template v-if="question.type_question === 'range'">
                                <RangeQuestion v-model="rubric.questions[index]"></RangeQuestion>
                            </template>

                            <template v-if="question.type_question === 'mc'">
                                <MCQuestion v-model="rubric.questions[index]"></MCQuestion>
                            </template>

                        <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
                        <b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete</b-button>

                    </b-card>
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
import VueNotifications from 'vue-notifications'
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
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CreateQuestionWizard
    },
    data() {
        return {
            rubric: {},
        }
    },
    async created() {
        await this.fetchRubric()
        this.rubric.questions.sort((a, b) => a.question_number - b.question_number)
    },
    methods: {
        async fetchRubric() {
            let res = await api.client.get(`/rubric/4`)
            this.rubric = res.data
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
    },
    notifications: {
        showSuccessMessage: {
            type: VueNotifications.types.success,
            title: 'Success',
            message: 'Success.'
        },
        showErrorMessage: {
            type: VueNotifications.types.error,
            title: 'Error',
            message: 'Error.'
        }
    }
}

</script>