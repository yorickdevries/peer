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
        // If we get a zip file, we'll try to unzip it and show one of the code files
        if (this.zipURL) {
            const url = this.zipURL
            // Promise to wrap the file loading in
            const promise = new JSZip.external.Promise(function(resolve, reject) {
                JSZipUtils.getBinaryContent(url, function(err, data) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            })
            // Actually load the zip file
            promise
                .then(JSZip.loadAsync)
                .then(function(zip) {
                    const files = Object.keys(zip.files)
                        .map(function(name) {
                            return zip.file(name)
                        })
                        .filter(function(file) {
                            // Filter out all null files
                            return file
                        })
                        .filter(function(file) {
                            // Filter out all files that are directories
                            return !file.dir
                        })
                    // List of promises that the zip files that still need to be loaded are wrapped in
                    const listOfPromises = Promise.all(
                        files.map(async function(entry) {
                            const code = await entry.async("string")
                            return code
                        })
                    )
                    // Once the loading of all files is actually done, we can return their contents
                    const contents = listOfPromises.then(function(list) {
                        return list
                    })
                    return contents
                })
                .then(function(contents) {
                    // TODO: add support for multiple files
                    // Highlight the contents of the found file(s)
                    const highlighted = hljs.highlightAuto(contents[0])
                    scope.content = highlighted.value.split(/\r?\n/g)
                })
        } else {
            // Leave support for single-submission files
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
