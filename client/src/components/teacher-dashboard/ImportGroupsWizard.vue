<template>
    <b-card header="Import groups">
        <!--Group name-->
        <b-form-group label="Enter name of group column">
            <b-form-input   v-model="groupColumn"
                            type="text"
                            placeholder="Name of group column"
                            required>
            </b-form-input>
        </b-form-group>
        <!--File upload-->
        <b-form-group label="CSV file from Brightspace" class="mb-0">
            <b-form-file    v-model="file"
                            accept=".csv"
                            :state="Boolean(file)"
                            placeholder="Choose a .csv file..."
                            required>
            </b-form-file>
            <b-button   variant="primary"
                        class="mt-3"
                        @click="importGroups">Import groups</b-button>
        </b-form-group>
    </b-card>
</template>

<script>
    import api from "../../api"

    export default {
        props: ['assignmentId'],
        data() {
            return {
                groupColumn: undefined,
                file: true,
                fileProgress: 0,
                uploadSuccess: null,
                acceptFiles: ".csv",
            }
        },
        methods: {
            // Submit to back-end
            async importGroups() {
                // Compose object to send to server
                let formData = new FormData()
                formData.append("groupColumn", this.groupColumn)
                formData.append("groupFile", this.file)

                // Send files to server
                let res = await api.client.post(`/assignments/${this.assignmentId}/importgroups`, formData)
                console.log(res)
            }
        }

    }
</script>

<style scoped>

</style>