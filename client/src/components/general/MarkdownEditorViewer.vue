<template>
    <div>
        <editor
            v-if="displayeditor"
            :initialValue="answer.answer"
            :options="editorOptions"
            height="500px"
            initialEditType="markdown"
            previewStyle="vertical"
            @change="getMarkdown()"
            ref="toastuiEditor"
        />
        <div v-else>
            <viewer v-if="answer.answer == null" :initialValue="answer" :options="editorOptions" height="500px" />
            <viewer :initialValue="answer.answer" :options="editorOptions" height="500px" />
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
    props: ["displayeditor", "answer"],
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
                    ["scrollSync"]
                ]
            }
        }
    },
    methods: {
        getMarkdown() {
            this.answer.answer = this.$refs.toastuiEditor.invoke("getMarkdown")
            this.answer.changed = true
            this.$emit("shortcut-save")
        }
    }
}
</script>
