
<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">

                    <b-card v-for="question in rubric.questions"
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

                            <template v-if="question.type_question === 'mc'">
                                <b-form-group label="Question text" description="Text above the range question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>

                                <b-form-group label="Multiple Choice Options">
                                    <template v-for="option in question.option">
                                        <b-form inline>
                                            <b-form-group class="mb-2">
                                                <b-form-input v-model="option.option" class="mr-2"></b-form-input>
                                                <b-button @click="deleteMPCOption(question, option)" variant="danger" size="sm">Delete</b-button>
                                            </b-form-group>
                                        </b-form>
                                    </template>
                                    <b-button @click="addMPCOption(question)" variant="success" size="sm">Add</b-button>
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
            console.log(`${apiPrefixes[question.type_question]}/${question.id}`)
            console.log(question)
            let res = await api.client.put(`${apiPrefixes[question.type_question]}/${question.id}`, question)
            console.log(res)
            this.showSuccessMessage({message: 'Successfully saved question.'})
            await this.fetchRubric()
        },
        addMPCOption(question) {
            question.option.push({
                option: "",
                mcquestion_id: question.id
            })
        },
        deleteMPCOption(question, option) {
            let index = question.option.findIndex(value => value === option)
            question.option.splice(index, 1)
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