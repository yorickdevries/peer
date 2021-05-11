<template>
    <b-card header="Files">
        <FileTreeNode
            @selected="onSelect"
            v-for="key in Object.keys(root)"
            :key="key"
            :propName="key"
            :propChildren="root[key]"
            :selected="selected"
        />
    </b-card>
</template>

<script>
import FileTreeNode from "./FileTreeNode"

export default {
    // "files" is an array of JSZip ZipObjects.
    // "selectedFile" is a path to the selected file
    props: ["files", "selectedFile"],
    components: {
        FileTreeNode
    },
    data() {
        return {
            root: null,
            selected: null
        }
    },
    created() {
        this.selected = this.selectedFile
        this.root = new Map()

        // Iterate over every file to populate the tree
        for (const file of this.files) {
            const subdirs = file.name.split("/")
            let entry = null
            // Pop file from directory list if it is a file
            if (!file.dir) {
                entry = subdirs.pop()
            }

            // Iteratively insert directories when needed
            let currentDir = this.root
            for (const subdir of subdirs) {
                currentDir[subdir] = currentDir[subdir] ?? new Map()
                currentDir = currentDir[subdir]
            }

            // Insert full file path if it is a file
            if (entry) {
                currentDir[entry] = { file: true, path: file.name }
                //  When no file is selected, select first file that it comes across
                if (!this.selected) {
                    this.selected = file.name
                    this.$emit("selected", this.selectd)
                }
            }
        }
    },
    methods: {
        onSelect(file) {
            this.selected = file
            this.$emit("selected", file)
        }
    }
}
</script>
