<template>
    <div>
        <iframe src="http://localhost/jupyter/index.html" width="100%" height="500px"></iframe>
    </div>
</template>

<script>
import api from "@/api/api"

export default {
    name: "JupyterWrapper",
    //TODO: remove redundant fileName prop
    props: ["file"],
    created() {
        // need to fetch jupyter file from backend
        console.log(this.file)
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
        async getJupyterText() {
            let files = await this.getAllFiles()
            try {
                const indexedDB = window.indexedDB
                const request = indexedDB.open("JupyterLite Storage")

                const db = await new Promise((resolve, reject) => {
                    request.onsuccess = (event) => resolve(event.target.result)
                    request.onerror = (event) => reject(event.target.error)
                })
                console.log(db)
                let transaction = db.transaction(["files"], "readonly")
                let objectStore = transaction.objectStore("files")
                console.log(objectStore)

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
                console.log(this.file)
                //TODO: Need to send jupyter file to backend
                return jupJson
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },
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
        // puts the notebook (receieved from backend) into indexedDB
        async saveJupyterText() {
            console.log(this.file)
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

                const key = this.file.name
                const value = this.file

                const addRequest = objectStore.add(value, key)

                // eslint-disable-next-line no-unused-vars
                addRequest.onsuccess = (event) => {
                    console.log("Key-value pair added successfully.")
                }

                addRequest.onerror = (event) => {
                    console.error("Error adding key-value pair:", event.target.error)
                }

                db.close()
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },
    },
}
</script>

<style scoped></style>
