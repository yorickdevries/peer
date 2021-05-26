<template>
    <b-card>
        <b-card-header role="button" @click="toggleCollapse">
            <icon name="chevron-down" :class="`chevron ${collapsed ? 'rotate' : ''}`" />
            {{ collapsed ? "" : "Files" }}
        </b-card-header>
        <b-collapse :visible="!collapsed">
            <b-card-body>
                <FileTreeNode
                    :root="true"
                    @selected="onSelect"
                    v-for="key in Object.keys(root)"
                    :commentedFiles="commentedFiles"
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
    props: ["commentedFiles", "files", "selectedFile", "startCollapsed"],
    components: {
        FileTreeNode
    },
    data() {
        return {
            root: null,
            selected: null,
            collapsed: false
        }
    },
    created() {
        this.collapsed = this.startCollapsed
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
    }
}
</script>
<style lang="scss">
.chevron {
    margin-right: 5px;
    transition: transform 0.2s ease-in-out;
}

.rotate {
    transform: rotate(-90deg);
}
</style>
