<template>
    <b-card header="Create new Question">
        <b-form-group label="Question Type" description="Choose out one of the questions.">
            <b-form-select :options="questionTypes" v-model="selectedType"></b-form-select>
        </b-form-group>

        <template v-if="selectedType === 'open'">
            <OpenQuestion v-model="openQuestion"></OpenQuestion>
            <b-button @click="createQuestion(openQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
        </template>

        <template v-if="selectedType === 'range'">
            <RangeQuestion v-model="rangeQuestion"></RangeQuestion>
            <b-button @click="createQuestion(rangeQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
        </template>

        <template v-if="selectedType === 'mc'">
            <MCQuestion v-model="mcQuestion"></MCQuestion>
            <b-button @click="createQuestion(mcQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
        </template>
    </b-card>
</template>

<script>
import OpenQuestion from './OpenQuestion'
import RangeQuestion from './RangeQuestion'
import MCQuestion from './MCQuestion'
import api from "../../../api"
import VueNotifications from "vue-notifications"

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
    },
    props: ['id', 'rubricId'],
    data() {
        return {
            selectedType: '',
            questionTypes: [
                { value: 'mc', text: 'Multiple Choice' },
                { value: 'range', text: 'Range' },
                { value: 'open', text: 'Open' },
            ],
            openQuestion: {
                question: '',
                rubric_assignment_id: this.rubricId,
                question_number: null
            },
            rangeQuestion: {
                question: '',
                range: null,
                rubric_assignment_id: this.rubricId,
                question_number: null
            },
            mcQuestion: {
                question: '',
                rubric_assignment_id: this.rubricId,
                question_number: null,
                option: []
            }
        }
    },
    watch: {
        rubricId(val) {
            this.openQuestion.rubric_assignment_id = val
            this.rangeQuestion.rubric_assignment_id = val
            this.mcQuestion.rubric_assignment_id = val
        }
    },
    methods: {
        async createQuestion(question, type) {
            // Special function to create MC question.
            if (type === 'mc') return this.createMCQuestion(question)

            await api.client.post(`${apiPrefixes[type]}`, question)
            this.showSuccessMessage({message: "Successfully created question."})
            this.$emit('saved')
        },
        async createMCQuestion(question) {

            // Create the MC question itself.
            let res = await api.client.post(`${apiPrefixes['mc']}`, {
                question: question.question,
                rubric_assignment_id: question.rubric_assignment_id,
                question_number: question.question_number
            })

            // Get the newly created ID of the MC question.
            let mcquestion_id = res.data.id

            // Create all the options.
            let options = question.option
            options.forEach(async option => {
                await api.client.post(`${apiPrefixes['mcoption']}`, {
                    option: option.option,
                    mcquestion_id: mcquestion_id
                })
            })

            this.showSuccessMessage({message: "Successfully created question."})
            this.$emit('saved')
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
