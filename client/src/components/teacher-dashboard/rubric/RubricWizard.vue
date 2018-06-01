
<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">

                    <b-card v-for="question in sortQuestions(rubric.questions)"
                            :key="question.id"
                            :header="`Question ${question.question_number}`"
                            class="mb-3">

                            <template v-if="question.type_question === 'open'">
                                <b-form-group label="Question text" description="Text above the open question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>
                            </template>

                            <template v-if="question.type_question === 'range'">
                                <b-form-group label="Question text" description="Text above the range question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>
                                <b-form-group label="Range" description="Maximum stars a student can give.">
                                    <b-form-input v-model="question.range" type="number"/>
                                </b-form-group>
                            </template>


                        <b-button @click="saveQuestion(question)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
                        <b-button @click="deleteQuestion(question)" variant="outline-danger" size="sm">Delete</b-button>

                    </b-card>

                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../../api";
import VueNotifications from 'vue-notifications'

let apiPrefixes = {
    open: '/rubric/openquestion',
    mc: '/rubric/mcquestion',
    range: '/rubric/rangequestion'
}
export default {
    data() {
        return {
            rubric: {}
        }
    },
    async created() {
        await this.fetchRubric()
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
            console.log(`${apiPrefixes[question.type_question]}/${question.id}`)
            console.log(question)
            let res = await api.client.put(`${apiPrefixes[question.type_question]}/${question.id}`, question)
            console.log(res)
            this.showSuccessMessage({message: 'Successfully saved question.'})
            await this.fetchRubric()
        },
        sortQuestions(questions) {
            return questions.sort((a, b) => a.question_number - b.question_number)
        }
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