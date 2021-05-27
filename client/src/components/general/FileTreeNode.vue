<template>
    <div>
        <div v-if="dir" class="dir" v-on:click="toggleCollapsed" role="button">
            <icon name="chevron-down" :class="`chevron ${collapsed ? 'rotate' : ''}`" role="button" />
            <icon class="text-muted" name="folder"></icon>
            {{ name }}
        </div>
        <div v-else @click="onSelect" v-bind:class="`${background} file d-flex justify-content-between`" role="button">
            <div>
                <icon class="text-muted" name="code"></icon>
                <span class="filename"> {{ name }}</span>
                <icon v-if="commented" class="text-muted comment-icon" name="comments" />
            </div>
        </div>

        <b-collapse style="margin-left: 1.5rem" v-if="dir" :visible="!collapsed">
            <FileTreeNode
                @selected="onChildSelect"
                v-for="key in Object.keys(children)"
                :commentedFiles="commentedFiles"
                :key="key"
                :propName="key"
                :propChildren="children[key]"
                :selected="selected"
            />
        </b-collapse>
    </div>
</template>

<script>
export default {
    name: "FileTreeNode",
    props: ["commentedFiles", "propName", "propChildren", "selected"],
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
        async toggleCollapsed() {
            // Let file tree know that its child is collapsing
            await this.$emit("toggleCollapse")
            this.collapsed = !this.collapsed
        }
    },
    computed: {
        background() {
            // The selected file is equal to the path of this file
            if (this.selected === this.children.path) {
                return "bg-dark text-light selected"
            } else {
                return "bg-white"
            }
        },
        commented() {
            return this.commentedFiles.has(this.children.path)
        }
    }
}
</script>

<style lang="scss" scoped>
$text-hover: #212529;
$background-hover: #f8f8f8;
$text-light: #f8f9fa;
$bg-dark: #343a40;
.selected.file:hover {
    background-color: scale-color($color: $bg-dark, $lightness: -30%) !important;
    .filename {
        color: $text-light !important;
    }
}
.file:hover {
    background-color: $background-hover !important;
    .filename {
        color: $text-hover;
    }
}
.comment-icon {
    margin-left: 5px;
}
</style>
