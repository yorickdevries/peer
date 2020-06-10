<template>
    <div>
        <b-form-group label="Question Number" description="The questions will be sorted on this number.">
            <b-form-input type="number" v-model="question.question_number" />
        </b-form-group>
        <b-form-group label="Question Text" description="The actual question that the student has to answer.">
            <b-form-textarea v-model="question.question" />
        </b-form-group>

        <b-form-group
            label="Multiple Choice Options"
            description="Delete, edit and add multiple choice options here. Make sure to save."
        >
            <template v-for="(option, index) in question.option">
                <b-form :key="index">
                    <div class="input-group mb-2">
                        <b-form-input v-model="option.option" :disabled="option.delete"></b-form-input>
                        <div class="input-group-append">
                            <b-button
                                @click="deleteMCOption(question, option)"
                                v-if="!option.delete"
                                variant="danger"
                                size="sm"
                                >Delete
                            </b-button>
                            <b-button @click="undoDeleteMCOption(option)" v-else variant="secondary" size="sm"
                                >Undo
                            </b-button>
                        </div>
                    </div>
                </b-form>
            </template>
            <b-button @click="addMCOption(question)" variant="success" size="sm">Add new option</b-button>
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
    props: ["value"],
    data() {
        return {
            question: this.value
        }
    },
    watch: {
        question(val) {
            this.$emit("input", val)
        },
        value(val) {
            this.question = val
        }
    },
    created() {
        // only add empty options when there are none yet
        if (this.question.option.length == 0) {
            this.addMCOption(this.question)
            this.addMCOption(this.question)
        }
    },
    methods: {
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
                this.$set(option, "delete", true)
            }
        },
        undoDeleteMCOption(option) {
            // Undo the mark to delete a MC option.
            option.delete = false
        }
    }
}
</script>
