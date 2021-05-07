<template>
    <div>
        <pre><code style="display: block" v-for="(line, index) in content" :key="index" v-html="line"></code></pre>
    </div>
</template>

<script>
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import JSZipUtils from "jszip-utils"
import JSZip from "jszip"
export default {
    props: ["fileUrl", "zipURL"],
    data() {
        return {
            content: null
        }
    },
    created() {
        let scope = this
        if (this.zipURL) {
            const url = this.zipURL
            const promise = new JSZip.external.Promise(function(resolve, reject) {
                JSZipUtils.getBinaryContent(url, function(err, data) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            })

            promise
                .then(JSZip.loadAsync)
                .then(function(zip) {
                    const files = Object.keys(zip.files)
                        .map(function(name) {
                            return zip.file(name)
                        })
                        .filter(function(file) {
                            return file
                        })

                    const listOfPromises = Promise.all(
                        files.map(function(entry) {
                            return entry.async("string").then(function(code) {
                                return code
                            })
                        })
                    )
                    const contents = listOfPromises.then(function(list) {
                        return list
                    })
                    return contents
                })
                .then(function(contents) {
                    console.log(contents)
                    // TODO: add support for multiple files
                    const highlighted = hljs.highlightAuto(contents[0])
                    scope.content = highlighted.value.split(/\r?\n/g)
                })
        } else {
            fetch(this.fileUrl)
                .then(response => response.text())
                .then(text => {
                    // hljs.highlightAuto expects a string (code) and optionally an array
                    // of language names / aliases
                    const highlighted = hljs.highlightAuto(text)
                    this.content = highlighted.value.split(/\r?\n/g)
                })
                .catch(console.warn)
        }
    }
}
</script>
