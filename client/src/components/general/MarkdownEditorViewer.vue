<template>
    <div>
        <div v-if="displayeditor">
            <editor
                :initialValue="answerObject.answer"
                :options="editorOptions"
                height="500px"
                initialEditType="markdown"
                previewStyle="vertical"
                @change="getMarkdown()"
                ref="toastuiEditor"
            />
            <p>Word Count: {{ this.wordCount }}</p>
        </div>
        <div v-else>
            <viewer
                :key="answerObject.answer"
                :initialValue="answerObject.answer == null ? answerObject : answerObject.answer"
                :options="editorOptions"
                height="500px"
            />
        </div>
    </div>
</template>

<script>
import "@toast-ui/editor/dist/toastui-editor.css"
import { Editor } from "@toast-ui/vue-editor"
import "@toast-ui/editor/dist/toastui-editor-viewer.css"
import { Viewer } from "@toast-ui/vue-editor"

export default {
    components: { editor: Editor, viewer: Viewer },
    props: ["displayeditor", "answerObject"],
    emits: ["shortcut-save"],
    data() {
        return {
            editorOptions: {
                hideModeSwitch: true,
                toolbarItems: [
                    ["heading", "bold", "italic", "strike"],
                    ["hr", "quote"],
                    ["ul", "ol", "task", "indent", "outdent"],
                    ["table", "link"],
                    ["code", "codeblock"],
                    ["scrollSync"],
                ],
            },
        }
    },
    computed: {
        wordCount() {
            return !this.answerObject.answer ? 0 : this.getWordCount()
        },
    },
    methods: {
        getMarkdown() {
            this.answerObject.answer = this.$refs.toastuiEditor.invoke("getMarkdown")
            this.answerObject.changed = true
            this.$emit("shortcut-save")
        },
        getWordCount() {
            const plainText = this.answerObject.answer.replace(/[#_*`-]/g, " ")
            const words = plainText.split(/\s+/)
            return words.length
        },
    },
    watch: {
        "answerObject.answer": function (newAnswer) {
            if (newAnswer === "") {
                this.$refs.toastuiEditor.invoke("reset")
            }
        },
    },
}
</script>
