<template>
    <b-card header="Create new Question">
        <b-form-group label="Question Type" description="Choose from on the question types.">
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

        <template v-if="selectedType === 'upload'">
            <UploadQuestion v-model="uploadQuestion"></UploadQuestion>
            <b-button @click="createQuestion(uploadQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
        </template>
    </b-card>
</template>

<script>
import OpenQuestion from './OpenQuestion'
import RangeQuestion from './RangeQuestion'
import UploadQuestion from './UploadQuestion'
import MCQuestion from './MCQuestion'
import api from "../../../api"
import notifications from '../../../mixins/notifications'

let apiPrefixes = {
    open: '/rubric/openquestion',
    mc: '/rubric/mcquestion',
    range: '/rubric/rangequestion',
    mcoption: '/rubric/mcoption',
    upload: '/rubric/uploadquestion',
}

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        UploadQuestion
    },
    props: ['id', 'rubricId'],
    data() {
        return {
            selectedType: '',
            questionTypes: [
                { value: 'mc', text: 'Multiple Choice' },
                { value: 'range', text: 'Range' },
                { value: 'open', text: 'Open' },
                { value: 'upload', text: 'Upload Question' },
            ],
            openQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null
            },
            rangeQuestion: {
                question: '',
                range: null,
                rubric_id: this.rubricId,
                question_number: null
            },
            mcQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                option: []
            },
            uploadQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                extension: null
            },
        }
    },
    watch: {
        rubricId(val) {
            this.openQuestion.rubric_id = val
            this.rangeQuestion.rubric_id = val
            this.mcQuestion.rubric_id = val
            this.uploadQuestion.rubric_id = val
        }
    },
    methods: {
        async createQuestion(question, type) {
            // Special function to create MC question.
            if (type === 'mc') return this.createMCQuestion(question)

            try {
                await api.client.post(`${apiPrefixes[type]}`, question)
                this.showSuccessMessage({message: "Successfully created question."})
                this.$emit('saved')
                this.onReset()
            } catch (e) {
                this.showErrorMessage({ message: "Error making question. Please make sure you have filled in all the fields."})
            }
        },
        async createMCQuestion(question) {

            // Create the MC question itself.
            let res = await api.client.post(`${apiPrefixes['mc']}`, {
                question: question.question,
                rubric_id: question.rubric_id,
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
            this.onReset()
        },
        onReset() {
            this.selectedType = ''
            this.openQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: null
            }
            this.rangeQuestion = {
                question: '',
                range: null,
                rubric_id: this.rubricId,
                question_number: null
            }
            this.mcQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                option: []
            }
            this.uploadQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                extension: null
            }
        }
    },

}
</script>
