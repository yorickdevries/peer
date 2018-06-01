<template>
    <div>
        <b-form-group label="Question Number" description="The question number. These questions will appear in this order (sorted).">
            <b-form-input type="number" v-model="question.question_number"/>
        </b-form-group>
        <b-form-group label="Question Text" description="Text above the range question.">
            <b-form-textarea v-model="question.question"/>
        </b-form-group>
        <b-form-group label="Range" description="Maximum stars a student can give.">
            <b-form-input v-model="question.range" type="number"/>
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
