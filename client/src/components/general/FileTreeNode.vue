<template>
    <div>
        <div v-if="dir" class="dir" v-on:click="notifyCollapsing" role="button">
            <icon name="chevron-down" :class="`chevron ${collapsed ? 'rotate' : ''}`" role="button" />
            <icon class="text-muted" name="folder"></icon>
            {{ name }}
        </div>
        <div v-else @click="onSelect" :class="{ selected, file: true }" role="button">
            <div>
                <icon name="code"></icon>
                <span class="filename"> {{ name }}</span>
            </div>
            <icon v-if="commented" class="comment-icon" name="comments" />
        </div>

        <b-collapse class="ml-4" v-if="dir" :visible="!collapsed">
            <FileTreeNode
                @toggleCollapse="onChildCollapse"
                @selected="onChildSelect"
                v-for="key in Object.keys(children)"
                :commentedFiles="commentedFiles"
                :key="key"
                :propName="key"
                :propChildren="children[key]"
                :selectedFile="selectedFile"
            />
        </b-collapse>
    </div>
</template>

<script>
export default {
    name: "FileTreeNode",
    props: ["commentedFiles", "propName", "propChildren", "selectedFile"],
    data() {
        return {
            name: null,
            children: null,
            dir: false,
            collapsed: false
        }
    },
    created() {
        this.children = this.propChildren
        this.name = this.propName
        this.dir = !this.children.file

        // Skip collapsing directories if this is a file
        if (!this.dir) {
            return
        }

        // While the directory only has a single child that is a directory, collapse it
        let keys = Object.keys(this.children)
        while (keys.length == 1) {
            const newChildren = this.children[keys[0]]
            if (newChildren.file) {
                break
            }

            this.name += "/" + keys[0]
            this.children = newChildren
            keys = Object.keys(this.children)
        }
    },
    methods: {
        onChildSelect(file) {
            this.$emit("selected", file)
        },
        onSelect() {
            this.$emit("selected", this.children.path)
        },
        notifyCollapsing() {
            // Let file tree know that its child has the intention to collapse
            this.$emit("toggleCollapse", this.name)
        },
        toggleCollapsed() {
            this.collapsed = !this.collapsed
        },
        onChildCollapse(name) {
            this.$emit("toggleCollapse", name)
        }
    },
    computed: {
        selected() {
            console.log(this.selectedFile, this.children.path)
            return this.selectedFile === this.children.path
        },
        commented() {
            return this.commentedFiles.has(this.children.path)
        }
    },
    mounted() {
        // Event listener waiting for the go-ahead to toggle the collapse state
        this.$root.$on("filetreenode::collapse", name => {
            if (this.name === name) {
                this.toggleCollapsed()
            }
        })
    }
}
</script>

<style lang="scss" scoped>
$background-hover: rgba(0, 0, 0, 0.03);

.selected.file {
    background-color: var(--gray);
    color: var(--light);

    &:hover {
        opacity: 0.7;
    }
}

:not(.selected).file {
    color: var(--gray);

    .filename {
        color: initial;
    }

    &:hover {
        background-color: $background-hover;
    }
}

.file {
    display: flex;
    justify-content: space-between;
}

.comment-icon {
    margin: auto 5px;
    display: inline-block;
}
</style>
