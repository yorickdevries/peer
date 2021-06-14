<template>
    <b-card class="filetree" no-body>
        <b-card-header role="button" @click="toggleCollapse" :class="{ 'header-collapse': collapsed }">
            <icon name="chevron-down" :class="`chevron ${collapsed ? 'rotate' : ''}`" />
            <transition name="fade"> <span v-if="!collapsed">Files</span> </transition>
        </b-card-header>
        <b-collapse :visible="!collapsed">
            <b-card-body>
                <FileTreeNode
                    @selected="onSelect"
                    v-for="key in Object.keys(root)"
                    :annotatedFiles="annotatedFiles"
                    :key="key"
                    :propName="key"
                    :propChildren="root[key]"
                    :selectedFile="selected"
                    @toggleCollapse="onChildCollapse"
                />
            </b-card-body>
        </b-collapse>
    </b-card>
</template>

<script>
import FileTreeNode from "./FileTreeNode"

export default {
    props: ["annotatedFiles", "files", "selectedFile", "startCollapsed"],
    components: {
        FileTreeNode
    },
    data() {
        return {
            root: null,
            selected: null,
            collapsed: false,
            minWidth: null,
            minHeight: null
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
            if (!this.collapsed) {
                this.minHeight = this.$el.style.getPropertyValue("min-height")
                this.minWidth = this.$el.style.getPropertyValue("min-width")
                this.$el.style.setProperty("min-height", "unset")
                this.$el.style.setProperty("min-width", "unset")
            } else {
                this.$el.style.setProperty("min-height", this.minHeight ?? "unset")
                this.$el.style.setProperty("min-width", this.minWidth ?? "unset")
            }
            this.collapsed = !this.collapsed
        }, // Used to conserve file tree size on child collapse
        onChildCollapse(name) {
            const el = this.$el
            const height = el.offsetHeight
            const width = el.offsetWidth
            el.style.setProperty("min-height", `${height}px`)
            el.style.setProperty("min-width", `${width}px`)
            // Gives the file tree node by this name the go-ahead to toggle collapse state
            this.$root.$emit("filetreenode::collapse", name)
        }
    }
}
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.filetree {
    max-height: 80vh;
}
</style>

<style lang="scss">
.chevron {
    margin-right: 5px;
    transition: transform 0.2s ease-in-out;
}

.rotate {
    transform: rotate(-90deg);
}
</style>
