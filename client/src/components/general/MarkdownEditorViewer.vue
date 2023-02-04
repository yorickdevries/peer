<template>
    <div>
        <editor
            v-if="displayeditor"
            :initialValue="answerObject.answer"
            :options="editorOptions"
            height="500px"
            initialEditType="markdown"
            previewStyle="vertical"
            @change="getMarkdown()"
            ref="toastuiEditor"
        />
        <div v-else>
            <viewer
                v-if="answerObject.answer == null"
                :initialValue="answerObject"
                :options="editorOptions"
                height="500px"
            />
            <viewer v-else :initialValue="answerObject.answer" :options="editorOptions" height="500px" />
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
    methods: {
        getMarkdown() {
            this.answerObject.answer = this.$refs.toastuiEditor.invoke("getMarkdown")
            this.answerObject.changed = true
            this.$emit("shortcut-save")
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
