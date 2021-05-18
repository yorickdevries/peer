<template>
    <div>
        <div v-if="dir" class="dir">
            <icon class="text-muted" name="folder"></icon>
            {{ name }}
        </div>
        <div v-else v-bind:class="`${background} file`" role="button">
            <icon class="text-muted" name="code"></icon>
            <span v-on:click="onSelect" class="filename"> {{ name }}</span>
        </div>

        <div style="margin-left: 1.5rem" v-if="dir">
            <FileTreeNode
                @selected="onChildSelect"
                v-for="key in Object.keys(children)"
                :key="key"
                :propName="key"
                :propChildren="children[key]"
                :selected="selected"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "FileTreeNode",
    props: ["propName", "propChildren", "selected"],
    data() {
        return {
            name: null,
            children: null,
            dir: false
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
    background-color: mix($bg-dark, $background-hover, 75%) !important;
    .filename {
        color: mix($text-light, $text-hover, 75%);
    }
}
.file:hover {
    background-color: $background-hover !important;
    .filename {
        color: $text-hover;
    }
}
.dir:hover {
    cursor: default;
}
</style>
