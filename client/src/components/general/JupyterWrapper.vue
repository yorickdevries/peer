<template>
    <div>
        <button v-if="loading" class="btn btn-primary" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Setting up Jupyter Environment...
        </button>
        <dt v-if="!isMobile">Submitted file may take a few seconds to load after jupyter environment is set up</dt>
        <iframe src="http://localhost/jupyter/index.html" width="100%" height="500px"></iframe>
    </div>
</template>

<script>
import api from "@/api/api"

export default {
    name: "JupyterWrapper",
    props: ["file"],
    data() {
        return {
            loading: true,
        }
    },
    async created() {
        const indexedDB = window.indexedDB
        const dbName = "JupyterLite Storage"

        const request = indexedDB.open(dbName)

        request.onsuccess = (event) => {
            const db = event.target.result

            const transaction = db.transaction(["files"], "readwrite")
            const objectStore = transaction.objectStore("files")

            const clearRequest = objectStore.clear()

            clearRequest.onsuccess = () => {
                console.log("Object store 'files' cleared successfully.")
            }

            clearRequest.onerror = (event) => {
                console.error("Error clearing object store 'files':", event.target.error)
            }
        }
    },
    methods: {
        async submitAnnotation(annotationText) {
            // Update the current state
            this.writing = false

            try {
                // Send the annotation to the server
                const res = await api.codeannotations.postAnnotation(
                    this.review.id,
                    annotationText,
                    this.startLineNumber,
                    this.endLineNumber,
                    this.highlightedFile
                )
                const annotation = res.data
                this.annotations.push(annotation)
            } catch (error) {
                this.showErrorMessage({ message: "Unable to submit annotation" })
            }
        },
        //  This method retrieves Jupyter notebook data from an IndexedDB database named "JupyterLite Storage."
        //  It opens the database, creates a transaction, retrieves the first file (fileKey) in the object store,
        //  and returns the Jupyter notebook content in JSON format. The retrieved data is also set in the this.file
        //  data property.
        async getJupyterText() {
            let files = await this.getAllFiles()
            try {
                const indexedDB = window.indexedDB
                const request = indexedDB.open("JupyterLite Storage")

                const db = await new Promise((resolve, reject) => {
                    request.onsuccess = (event) => resolve(event.target.result)
                    request.onerror = (event) => reject(event.target.error)
                })
                let transaction = db.transaction(["files"], "readonly")
                let objectStore = transaction.objectStore("files")

                // gets first file in indexedDB FOR NOW
                //TODO: Get all files added
                const fileKey = files[0]

                const fileData = await new Promise((resolve, reject) => {
                    const getRequest = objectStore.get(fileKey)
                    getRequest.onsuccess = (event) => resolve(event.target.result)
                    getRequest.onerror = (event) => reject(event.target.error)
                })
                const jupJson = fileData
                this.file = jupJson
                return jupJson
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },
        // This method retrieves all files in the IndexedDB database named "JupyterLite Storage."
        async getAllFiles() {
            try {
                const indexedDB = window.indexedDB
                const request = indexedDB.open("JupyterLite Storage")

                const db = await new Promise((resolve, reject) => {
                    request.onsuccess = (event) => resolve(event.target.result)
                    request.onerror = (event) => reject(event.target.error)
                })

                const transaction = db.transaction(["files"], "readonly")
                const objectStore = transaction.objectStore("files")

                const files = []

                const cursorRequest = objectStore.openCursor()

                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result
                    if (cursor) {
                        files.push(cursor.key)
                        cursor.continue()
                    } else {
                        console.log("All files retrieved:", files)
                    }
                }
                cursorRequest.onerror = (event) => {
                    console.error("Cursor error:", event.target.error)
                }
                return files
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },
        async makeJupFileAlt() {
            // this.fileJson = await this.getJupFile()
            // console.log(this.fileJson)
            console.log(this.file)
            console.log("above")
            // eslint-disable-next-line no-prototype-builtins
            if (this.file.hasOwnProperty("size")) {
                let jupText = this.file
                console.log(jupText)
                // const blob = new Blob([JSON.stringify(jupText)], { type: "application/json" })
                // const retVal = new File([blob], "jupyterSubmission.ipynb", { type: "application/json" })
                return jupText
            }
            console.log(this.file)
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
            jupText.content = this.file
            console.log(jupText)
            // const blob = new Blob([JSON.stringify(jupText)], { type: "application/json" })
            // const retVal = new File([blob], "jupyterSubmission.ipynb", { type: "application/json" })
            return jupText
        },
        // puts the notebook (receieved from backend) into indexedDB
        // This method is used to store Jupyter notebook data in the IndexedDB. It opens the database, creates a
        // transaction, and then adds the Jupyter notebook content as a key-value pair in the "files" object store.
        // It sets the key as the file name (this.file.name) and the value as the Jupyter notebook content.
        // If the addition is successful, it sets the loading property to false and returns true. If an error occurs,
        // it returns false.
        async saveJupyterText() {
            try {
                const indexedDB = window.indexedDB
                const request = indexedDB.open("JupyterLite Storage")

                const db = await new Promise((resolve, reject) => {
                    request.onsuccess = (event) => resolve(event.target.result)
                    request.onerror = (event) => reject(event.target.error)
                })
                let transaction = db.transaction(["files"], "readonly")
                let objectStore = transaction.objectStore("files")

                objectStore = db.transaction("files", "readwrite").objectStore("files")
                this.file = await this.makeJupFileAlt()
                const key = this.file.name
                const value = this.file
                console.log(this.file)
                const addRequest = await objectStore.add(value, key)

                addRequest.onsuccess = () => {
                    console.log("Key-value pair added successfully.")
                }

                addRequest.onerror = (event) => {
                    console.error("Error adding key-value pair:", event.target.error)
                }

                await db.close()
                this.loading = false
                return true
            } catch (error) {
                console.error(error)
                return false
            }
        },
        watch: {
            file: {
                immediate: true,
                handler() {
                    let dbName = "JupyterLite Storage"
                    console.log("asdasdasdasdasdasd")
                    console.log(this.file)
                    indexedDB
                        .databases()
                        .then(async (databases) => {
                            const exists = databases.some((database) => database.name === dbName)
                            console.log(`Database ${dbName} exists: ${exists}`)

                            if (exists) {
                                const openRequest = indexedDB.open(dbName)
                                openRequest.onsuccess = () => {
                                    let intervalId = setInterval(async () => {
                                        try {
                                            console.log("Checking for objectStore")
                                            const result = await this.saveJupyterText()
                                            if (result === true) {
                                                clearInterval(intervalId)
                                                console.log("finished")
                                            }
                                        } catch (error) {
                                            console.error(`An error occurred: ${error}`)
                                        }
                                    }, 1000)
                                }
                            }
                        })
                        .catch((error) => {
                            console.error(`An error occurred: ${error}`)
                        })
                },
            },
        },
    },
}
</script>

<style scoped></style>
