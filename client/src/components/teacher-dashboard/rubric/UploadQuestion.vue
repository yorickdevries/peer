<template>
    <div>
        <b-form-group label="Question Number" description="The question number. These questions will appear in this order (sorted).">
            <b-form-input type="number" v-model="question.question_number"/>
        </b-form-group>
        <b-form-group label="Question Text" description="Text above the upload question.">
            <b-form-textarea v-model="question.question"/>
        </b-form-group>
        <b-form-group label="Allowed file extension" description="The extension type allowed.">
            <b-form-select :options="extensionTypes" v-model="question.extension"></b-form-select>
        </b-form-group>
        <b-form-group label="Optional Question" description="Make this question optional for the student.">
            <b-form-checkbox v-model="question.optional">
                Make this question optional.
            </b-form-checkbox>
        </b-form-group>
    </div>
</template>

<script>
export default {
    props: ['value'],
    data() {
        return {
            question: this.value,
            extensionTypes: [
                { value: 'pdf', text: 'PDF' },
                { value: 'zip', text: 'Zip' },
            ],
        }
    },
    watch: {
        question(val) {
            this.$emit('input', val)
        },
        value(val) {
            this.question = val
        }
    }
}
</script>
