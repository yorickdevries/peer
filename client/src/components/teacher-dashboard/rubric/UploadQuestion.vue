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

    </div>
</template>

<script>
export default {
    props: ['value'],
    data() {
        return {
            question: this.value,
            extensionTypes: [
                { value: '.pdf', text: '.pdf' },
                { value: '.zip', text: '.zip' },
                { value: '.doc,.docx', text: '.doc,.docx' },
                { value: '.pdf,.zip,.doc,.docx', text: '.pdf,.zip,.doc,.docx' },
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
