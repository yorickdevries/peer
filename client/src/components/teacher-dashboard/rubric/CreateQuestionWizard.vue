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

        <template v-if="selectedType === 'checkbox'">
            <CheckboxQuestion v-model="checkboxQuestion"></CheckboxQuestion>
            <b-button @click="createQuestion(checkboxQuestion, selectedType)" variant="outline-primary" size="sm" class="mr-1">Save</b-button>
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
import CheckboxQuestion from './CheckboxQuestion'
import api from "../../../api"
import notifications from '../../../mixins/notifications'

let apiPrefixes = {
    open: '/rubric/openquestion',
    range: '/rubric/rangequestion',
    mc: '/rubric/mcquestion',
    mcoption: '/rubric/mcoption',
    checkbox: '/rubric/checkboxquestion',
    checkboxoption: '/rubric/checkboxoption',
    upload: '/rubric/uploadquestion',
}

export default {
    mixins: [notifications],
    components: {
        OpenQuestion,
        RangeQuestion,
        MCQuestion,
        CheckboxQuestion,
        UploadQuestion
    },
    props: ['id', 'rubricId', 'nextNewQuestionNumber'],
    data() {
        return {
            selectedType: '',
            questionTypes: [
                { value: 'mc', text: 'Multiple Choice' },
                { value: 'checkbox', text: 'Checkbox' },
                { value: 'range', text: 'Range' },
                { value: 'open', text: 'Open' },
                { value: 'upload', text: 'Upload Question' },
            ],
            openQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                optional: false
            },
            rangeQuestion: {
                question: '',
                range: null,
                rubric_id: this.rubricId,
                question_number: null,
                optional: false
            },
            mcQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                option: [],
                optional: false
            },
            checkboxQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                option: [],
                optional: false
            },
            uploadQuestion: {
                question: '',
                rubric_id: this.rubricId,
                question_number: null,
                extension: null,
                optional: false
            },
        }
    },
    watch: {
        rubricId(val) {
            this.openQuestion.rubric_id = val
            this.rangeQuestion.rubric_id = val
            this.mcQuestion.rubric_id = val
            this.checkboxQuestion.rubric_id = val
            this.uploadQuestion.rubric_id = val
        },
        nextNewQuestionNumber(val) {
            this.openQuestion.question_number = val
            this.rangeQuestion.question_number = val
            this.mcQuestion.question_number = val
            this.checkboxQuestion.question_number = val
            this.uploadQuestion.question_number = val
        }
    },
    created() {
        this.onReset()
    },
    methods: {
        async createQuestion(question, type) {
            // Special function to create MC question.
            if (type === 'mc') return this.createMCQuestion(question)
            // Special function to create Checkbox question.
            if (type === 'checkbox') return this.createCheckboxQuestion(question)

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
                question_number: question.question_number,
                optional: question.optional
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
        async createCheckboxQuestion(question) {

            // Create the Checkbox question itself.
            let res = await api.client.post(`${apiPrefixes['checkbox']}`, {
                question: question.question,
                rubric_id: question.rubric_id,
                question_number: question.question_number
            })

            // Get the newly created ID of the Checkbox question.
            let checkboxquestion_id = res.data.id

            // Create all the options.
            let options = question.option
            options.forEach(async option => {
                await api.client.post(`${apiPrefixes['checkboxoption']}`, {
                    option: option.option,
                    checkboxquestion_id: checkboxquestion_id
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
                question_number: this.nextNewQuestionNumber,
                optional: false
            }
            this.rangeQuestion = {
                question: '',
                range: null,
                rubric_id: this.rubricId,
                question_number: this.nextNewQuestionNumber,
                optional: false
            }
            this.mcQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: this.nextNewQuestionNumber,
                option: [],
                optional: false
            },
            this.checkboxQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: this.nextNewQuestionNumber,
                option: [],
                optional: false
            }
            this.uploadQuestion = {
                question: '',
                rubric_id: this.rubricId,
                question_number: this.nextNewQuestionNumber,
                extension: null,
                optional: false
            }
        }
    },

}
</script>
