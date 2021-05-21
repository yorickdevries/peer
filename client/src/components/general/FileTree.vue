<template>
    <b-card>
        <b-card-header role="button" @click="toggleCollapse">
            <icon :name="collapsed ? 'chevron-right' : 'chevron-down'" class="chevron" />
            {{ collapsed ? "" : "Files" }}
        </b-card-header>
        <b-collapse :visible="!collapsed">
            <b-card-body :style="{ 'min-width': collapsed ? 'auto' : fixedWidth }">
                <FileTreeNode
                    @selected="onSelect"
                    v-for="key in Object.keys(root)"
                    :key="key"
                    :propName="key"
                    :propChildren="root[key]"
                    :selected="selected"
                />
            </b-card-body>
        </b-collapse>
    </b-card>
</template>

<script>
import FileTreeNode from "./FileTreeNode"

export default {
    // "files" is an array of JSZip ZipObjects.
    // "selectedFile" is a path to the selected file
    props: {
        files: Array,
        selectedFile: String,
        startCollapsed: Boolean
    },
    components: {
        FileTreeNode
    },
    data() {
        return {
            root: null,
            selected: null,
            collapsed: false,
            maxDepth: -1,
            maxFileNameLength: -1
        }
    },
    created() {
        this.collapsed = this.startCollapsed
        this.selected = this.selectedFile
        this.root = new Map()
        this.maxDepth = -1

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
            // Variable to count the file tree depth
            let currentDepth = 0
            for (const subdir of subdirs) {
                if (!currentDir[subdir]) {
                    currentDir[subdir] = new Map()
                    currentDepth++
                }
                currentDir = currentDir[subdir]
                this.maxDepth = Math.max(this.maxDepth, currentDepth)
            }

            // Insert full file path if it is a file
            if (entry) {
                this.maxFileNameLength = Math.max(this.maxFileNameLength, file.name.length)
                currentDir[entry] = { file: true, path: file.name }
                //  When no file is selected, select first file that it comes across
                if (!this.selected) {
                    this.selected = file.name
                    this.$emit("selected", this.selected)
                }
            }
        }
    },
    methods: {
        onSelect(file) {
            this.selected = file
            this.$emit("selected", file)
        },
        toggleCollapse() {
            this.collapsed = !this.collapsed
        }
    },
    computed: {
        fixedWidth() {
            return `${this.maxDepth * 1 + this.maxFileNameLength}rem!important`
        }
    }
}
</script>
<style lang="scss" scoped>
.chevron {
    margin-right: 5px;
}
</style>
