<template>
    <div>
        <b-form-group label="Question Number" description="The question number. These questions will appear in this order (sorted).">
            <b-form-input type="number" v-model="question.question_number"/>
        </b-form-group>
        <b-form-group label="Question Text" description="Text above the Checkbox question.">
            <b-form-textarea v-model="question.question"/>
        </b-form-group>

        <b-form-group label="Checkbox Options" description="Delete, edit and add Checkbox options here. Make sure to save.">
            <template v-for="(option, index) in question.option">
                <b-form :key="index">
                    <div class="input-group mb-2">
                        <b-form-input v-model="option.option" :disabled="option.delete"></b-form-input>
                        <div class="input-group-append">
                            <b-button @click="deleteCheckboxOption(question, option)" v-if="!option.delete" variant="danger"
                                      size="sm">Delete
                            </b-button>
                            <b-button @click="undoDeleteCheckboxOption(option)" v-else variant="secondary" size="sm">Undo
                            </b-button>
                        </div>
                    </div>
                </b-form>
            </template>
            <b-button @click="addCheckboxOption(question)" variant="success" size="sm">Add new option</b-button>
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
    },
    created() {
        // only add empty options when there are none yet
        if (this.question.option.length == 0) {
            this.addCheckboxOption(this.question)
            this.addCheckboxOption(this.question)
        }
    },
    methods: {
        addCheckboxOption(question) {
            question.option.push({
                option: "",
                checkboxquestion_id: question.id
            })
        },
        deleteCheckboxOption(question, option) {
            // Mark a Checkbox option as deleted.
            if (option.id === undefined) {
                let index = question.option.findIndex(value => value === option)
                question.option.splice(index, 1)
            } else {
                this.$set(option, 'delete', true)
            }
        },
        undoDeleteCheckboxOption(option) {
            // Undo the mark to delete a Checkbox option.
            option.delete = false
        }
    }
}
</script>
