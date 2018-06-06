<template>
    <div>
        <b-form-group label="Question Number" description="The question number. These questions will appear in this order (sorted).">
            <b-form-input v-model="question.question_number" type="number"/>
        </b-form-group>
        <b-form-group label="Question Text" description="Text above the open question.">
            <b-form-textarea v-model="question.question"/>
        </b-form-group>
    </div>
</template>

<script>
export default {
    props: ['value'],
    data() {
        return {
            question: this.value
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
