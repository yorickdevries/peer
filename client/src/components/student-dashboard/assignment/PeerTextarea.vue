<template>
    <div>
        <form @submit.prevent="onSubmit" @reset.prevent="onCancel">
            <b-form-textarea
                ref="textarea"
                v-bind="$attrs"
                v-model="text"
                :state="validateContentLength()"
            ></b-form-textarea>
            <b-button variant="outline-primary" type="button" @click="insertCodeBlock()">
                Insert inline code block
            </b-button>
            <b-button variant="primary" type="submit">Submit</b-button>
            <b-button variant="danger" type="reset">Cancel</b-button>
        </form>
    </div>
</template>

<script>
import hljs from "highlight.js"
import notifications from "../../../mixins/notifications"

export default {
    mixins: [notifications],
    props: ["defaultContent", "defaultLanguage", "maxLength"],
    data() {
        return {
            text: this.defaultContent || "",
            codeBlockTemplate: ""
        }
    },
    created() {
        let language = ""
        if (hljs.getLanguage(this.defaultLanguage)) {
            language = this.defaultLanguage + " "
        }
        this.codeBlockTemplate = `\`\`\`${language}@\`\`\``
    },
    methods: {
        validateContentLength() {
            if (this.maxLength === undefined) {
                return null
            }
            return this.text.length <= this.maxLength
        },
        insertCodeBlock() {
            const cursorPosition = this.$refs.textarea.selectionStart
            const untilCursor = this.text.substr(0, cursorPosition)
            const fromCursor = this.text.substr(cursorPosition)

            this.text = `${untilCursor}${this.codeBlockTemplate.replace("@", "")}${fromCursor}`
            this.$refs.textarea.$nextTick(() => {
                this.$refs.textarea.focus()
                this.$refs.textarea.selectionStart = cursorPosition + this.codeBlockTemplate.indexOf("@")
                this.$refs.textarea.selectionEnd = this.$refs.textarea.selectionStart
            })
        },
        onSubmit() {
            if (!this.validateContentLength()) {
                this.showErrorMessage({
                    message: `Your input is ${this.text.length} characters long, which is over the allowed limit of ${this.maxLength} characters.`
                })
            } else {
                this.$emit("submit", this.text)
            }
        },
        onCancel() {
            this.$emit("cancel")
        }
    }
}
</script>
