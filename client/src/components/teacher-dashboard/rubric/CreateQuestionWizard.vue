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

    </b-card>
</template>

<script>
import OpenQuestion from './OpenQuestion'
import RangeQuestion from './RangeQuestion'
import MCQuestion from './MCQuestion'
import api from "../../../api"

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
            }
        }
    },
    methods: {
        async createQuestion(question, type) {
            await api.client.post(`${apiPrefixes[type]}`, question)
        }
    }

}
</script>
