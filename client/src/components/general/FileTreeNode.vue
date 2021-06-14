<template>
    <div>
        <div
            v-if="dir"
            class="dir"
            v-on:click="notifyCollapsing"
            v-on:keydown.enter.space="notifyCollapsing"
            @keydown.space.prevent
            role="button"
            tabindex="0"
        >
            <icon name="chevron-down" :class="`chevron ${collapsed ? 'rotate' : ''}`" role="button" />
            <icon class="text-muted" name="folder"></icon>
            <span>{{ name }}</span>
        </div>
        <div
            v-else
            v-on:click="onSelect"
            v-on:keydown.enter.space="onSelect"
            @keydown.space.prevent
            :class="{ selected, file: true }"
            role="button"
            tabindex="0"
        >
            <div>
                <icon name="code"></icon>
                <span>{{ name }}</span>
            </div>
            <icon v-if="annotated" class="annotation-icon" name="comments" />
        </div>

        <b-collapse class="ml-4" v-if="dir" :visible="!collapsed">
            <FileTreeNode
                @toggleCollapse="onChildCollapse"
                @selected="onChildSelect"
                v-for="key in Object.keys(children)"
                :annotatedFiles="annotatedFiles"
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
    props: ["annotatedFiles", "propName", "propChildren", "selectedFile"],
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
            return this.selectedFile === this.children.path
        },
        annotated() {
            return this.annotatedFiles.has(this.children.path)
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
    font-weight: bolder;

    &:hover {
        background-color: var(--dark);
    }
}

:not(.selected).file {
    color: var(--gray);
}

:not(.selected).file,
:not(.selected).dir {
    span {
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

.file,
.dir {
    &:hover {
        text-decoration: underline;
    }

    div:first-child {
        margin-left: 5px;
    }

    span {
        margin-left: 5px;
    }
}

.annotation-icon {
    margin: auto 5px;
    display: inline-block;
}
</style>
