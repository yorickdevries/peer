<template>
    <div>
        <editor
            v-if="displayeditor"
            :initialValue="answers[question.id].answer"
            :options="editorOptions"
            height="500px"
            initialEditType="markdown"
            previewStyle="vertical"
            @change="getMarkdown(answers, question, questions)"
            ref="toastuiEditor"
        />
        <viewer
            v-if="!displayeditor"
            :initialValue="answers[question.id].answer"
            :options="editorOptions"
            height="500px"
        />
    </div>
</template>

<script>
import "@toast-ui/editor/dist/toastui-editor.css"
import { Editor } from "@toast-ui/vue-editor"
import "@toast-ui/editor/dist/toastui-editor-viewer.css"
import { Viewer } from "@toast-ui/vue-editor"

export default {
    components: { editor: Editor, viewer: Viewer },
    props: ["initialvalue", "answers", "question", "questions", "displayeditor"],
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
                    ["scrollSync"]
                ]
            }
        }
    },
    methods: {
        getMarkdown(answers, question, questions) {
            for (let i = 0; i < questions.length; i++) {
                if (questions[i].type == "open") {
                    answers[questions[i].id].answer = this.$refs.toastuiEditor.invoke("getMarkdown")
                }
            }
            answers[question.id].changed = true
        }
    }
}
</script>
