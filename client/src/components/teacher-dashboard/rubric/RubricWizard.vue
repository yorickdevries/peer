
<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card header="Rubric Wizard" class="mt-4">

                    <b-card v-for="question in rubric.questions"
                            :key="question.id"
                            :header="`Question ${question.question_number} [${question.type_question.toUpperCase()}]`"
                            class="mb-3">

                            <b-form-group label="Question Number" description="The question number. These questions will appear in this order (sorted).">
                                <b-form-input type="number" v-model="question.question_number"/>
                            </b-form-group>

                            <template v-if="question.type_question === 'open'">
                                <b-form-group label="Question Text" description="Text above the open question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>
                            </template>

                            <template v-if="question.type_question === 'range'">
                                <b-form-group label="Question Text" description="Text above the range question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>
                                <b-form-group label="Range" description="Maximum stars a student can give.">
                                    <b-form-input v-model="question.range" type="number"/>
                                </b-form-group>
                            </template>

                            <template v-if="question.type_question === 'mc'">
                                <b-form-group label="Question Text" description="Text above the MC question.">
                                    <b-form-textarea v-model="question.question"/>
                                </b-form-group>

                                <b-form-group label="Multiple Choice Options" description="Delete, edit and add MC options here. Make sure to save.">
                                    <template v-for="option in question.option">
                                        <b-form inline>
                                            <b-form-group class="mb-2">
                                                <b-form-input v-model="option.option" :disabled="option.delete" class="mr-2"></b-form-input>
                                                <b-button @click="deleteMCOption(question, option)" v-if="!option.delete" variant="danger" size="sm">Delete</b-button>
                                                <b-button @click="undoDeleteMCOption(option)" v-else variant="seconadry" size="sm">Undo</b-button>
                                            </b-form-group>
                                        </b-form>
                                    </template>
                                    <b-button @click="addMCOption(question)" variant="success" size="sm">Add new option</b-button>
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
    range: '/rubric/rangequestion',
    mcoption: '/rubric/mcoption',
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
        addMCOption(question) {
            question.option.push({
                option: "",
                mcquestion_id: question.id
            })
        },
        deleteMCOption(question, option) {
            // Mark a MC option as deleted.
            if (option.id === undefined) {
                let index = question.option.findIndex(value => value === option)
                question.option.splice(index, 1)
            } else {
                this.$set(option, 'delete', true)
            }
        },
        undoDeleteMCOption(option) {
            // Undo the mark to delete a MC option.
            option.delete = false
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