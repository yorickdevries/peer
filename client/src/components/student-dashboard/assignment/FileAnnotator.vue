<template>
    <div>
        <PDFAnnotator
            v-if="renderAs === 'document'"
            :reviewId="reviewId"
            :submissionId="submissionId"
            :readOnly="readOnly"
            :reviewColors="reviewColors || defaultReviewColor"
            :ignoreAnnotations="ignoreAnnotations"
        />
        <CodeWrapper
            v-else-if="renderAs === 'code'"
            :fileUrl="filePath"
            :readOnly="readOnly"
            :submissionId="submissionId"
            :reviewId="reviewId"
            :reviewColors="reviewColors || defaultReviewColor"
            :ignoreAnnotations="ignoreAnnotations"
        />
        <JupyterWrapper v-else-if="renderAs === 'jupyter'" ref="jupyterEditor" :file="fileJson" />
        <div v-else>
            <b-alert show variant="secondary">
                No file annotation is available, because the assignment type was not recognized.</b-alert
            >
        </div>
    </div>
</template>

<script>
import JSZip from "jszip"
import CodeWrapper from "./../../general/CodeWrapper"
import PDFAnnotator from "./PDFAnnotator"
import JupyterWrapper from "./../../general/JupyterWrapper"

export default {
    components: {
        CodeWrapper,
        PDFAnnotator,
        JupyterWrapper,
    },
    props: ["reviewId", "submissionId", "readOnly", "assignmentType", "reviewColors", "ignoreAnnotations", "file"],
    computed: {
        filePath() {
            if (this.reviewId) {
                return `/api/reviewofsubmissions/${this.reviewId}/file`
            } else if (this.submissionId) {
                return `/api/submissions/${this.submissionId}/file`
            } else {
                return ""
            }
        },
        defaultReviewColor() {
            return { [this.reviewId]: "#ffb000" }
        },
    },
    data() {
        return {
            renderAs: "",
            fileJson: "",
        }
    },
    methods: {
        async getJupFile() {
            console.log(this.filePath)
            return new Promise((resolve, reject) => {
                fetch(this.filePath)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const fileReader = new FileReader()
                        fileReader.onload = function (event) {
                            const fileContents = event.target.result
                            console.log(fileContents)
                            console.log(fileContents.length)
                            this.fileJson = fileContents
                            resolve(fileContents)
                        }
                        fileReader.readAsText(blob)
                    })
                    .catch((error) => {
                        console.error(error)
                        reject(error)
                    })
            })
        },
        // async makeJupFile() {
        //     let jupText = await this.$refs.jupyterEditor.getJupyterText()
        //     console.log(jupText)
        //     const blob = new Blob([JSON.stringify(jupText)], { type: "application/json" })
        //     const retVal = new File([blob], "jupyterSubmission.ipynb", { type: "application/json" })
        //     return retVal
        // },
        async makeJupFileAlt() {
            // this.fileJson = await this.getJupFile()
            // console.log(this.fileJson)
            console.log(this.fileJson)
            console.log("above")
            // eslint-disable-next-line no-prototype-builtins
            if (this.fileJson.hasOwnProperty("size")) {
                let jupText = this.fileJson
                console.log(jupText)
                const blob = new Blob([JSON.stringify(jupText)], { type: "application/json" })
                const retVal = new File([blob], "jupyterSubmission.ipynb", { type: "application/json" })
                this.$refs.jupyterEditor.file = jupText
                console.log(this.$refs.jupyterEditor.file)
                return retVal
            }
            console.log(this.fileJson)
            let jsonStr = `{
  "size": 75,
  "name": "firstSub.ipynb",
  "path": "firstSub.ipynb",
  "last_modified": "2023-10-15T08:38:08.743Z",
  "created": "2023-10-15T08:37:50.586Z",
  "format": "json",
  "mimetype": "application/json",
  "content": {
    "metadata": {
      "language_info": {
        "codemirror_mode": {
          "name": "python",
          "version": 3
        },
        "file_extension": ".py",
        "mimetype": "text/x-python",
        "name": "python",
        "nbconvert_exporter": "python",
        "pygments_lexer": "ipython3",
        "version": "3.8"
      },
      "kernelspec": {
        "name": "python",
        "display_name": "Python (Pyodide)",
        "language": "python"
      }
    },
    "nbformat_minor": 4,
    "nbformat": 4,
    "cells": [
      {
        "cell_type": "code",
        "source": "print(\\"hello\\")",
        "metadata": {
          "trusted": true
        },
        "execution_count": 1,
        "outputs": [
          {
            "name": "stdout",
            "text": "hello\\n",
            "output_type": "stream"
          }
        ]
      },
      {
        "cell_type": "code",
        "source": "",
        "metadata": {},
        "execution_count": null,
        "outputs": []
      }
    ]
  },
  "writable": true,
  "type": "notebook"
}`
            let jupText = JSON.parse(jsonStr)
            jupText.content = this.fileJson
            console.log(jupText)
            const blob = new Blob([JSON.stringify(jupText)], { type: "application/json" })
            const retVal = new File([blob], "jupyterSubmission.ipynb", { type: "application/json" })
            this.$refs.jupyterEditor.file = jupText
            console.log(this.$refs.jupyterEditor.file)
            return retVal
        },
    },
    async created() {
        if (this.assignmentType) {
            this.renderAs = this.assignmentType
            if (this.file.extension === ".ipynb") {
                this.renderAs = "jupyter"
                let tmp = await this.getJupFile()
                this.fileJson = JSON.parse(tmp)
                console.log(this.fileJson)
                this.$refs.jupyterEditor.file = this.fileJson

                const dbName = "JupyterLite Storage"
                const vm = this.$refs.jupyterEditor
                indexedDB.databases().then(async (databases) => {
                    const exists = databases.some((database) => database.name === dbName)
                    console.log(`Database ${dbName} exists: ${exists}`)
                    if (exists) {
                        const openRequest = indexedDB.open(dbName)
                        openRequest.onsuccess = async function () {
                            let intervalId = setInterval(async function () {
                                console.log("Checking for objectStore")
                                if (await vm.saveJupyterText()) {
                                    clearInterval(intervalId)
                                }
                            }, 1000)
                        }
                    }
                })
            }
        } else {
            fetch(this.filePath)
                .then((res) => res.blob())
                .then((file) => {
                    if (file.type.includes("text/plain")) {
                        // The given file contains plain text and should be rendered as code
                        this.renderAs = "code"
                    } else {
                        // The given file contains binary data, we should test whether it is a zip or a
                        // pdf
                        JSZip.loadAsync(file)
                            .then(() => {
                                // JSZip thinks this file is a zip file, so it should be rendered as
                                // code
                                this.renderAs = "code"
                            })
                            .catch(() => {
                                // JSZip could not unzip the file, which means it might be a pdf file
                                // so it should be rendered as a pdf
                                this.renderAs = "document"
                            })
                    }
                })
                .catch(console.error)
        }
    },
}
</script>
