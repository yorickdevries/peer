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

                objectStore = db.transaction("files", "readwrite").objectStore("files")

                const key = "file123"
                const value = { fileName: "example.txt", content: "This is the file content." }

                const addRequest = objectStore.add(value, key)

                // eslint-disable-next-line no-unused-vars
                addRequest.onsuccess = (event) => {
                    console.log("Key-value pair added successfully.")
                }

                addRequest.onerror = (event) => {
                    console.error("Error adding key-value pair:", event.target.error)
                }

                db.close()

                const fileKey = "Untitled.ipynb"

                const fileData = await new Promise((resolve, reject) => {
                    const getRequest = objectStore.get(fileKey)
                    getRequest.onsuccess = (event) => resolve(event.target.result)
                    getRequest.onerror = (event) => reject(event.target.error)
                })
                const jupJson = JSON.stringify(fileData)
                console.log(jupJson)
                this.saveJupyter()
                return jupJson
            } catch (error) {
                console.error("An error occurred:", error)
            }
        },
    },
}
</script>

<style scoped></style>
