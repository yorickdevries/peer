<template>
    <b-card header="Import groups">
        <b-alert class="d-flex justify-content-between flex-wrap" show variant="primary">
            <p>Please upload a comma separated file containing the groups e.g. Brightspace export</p>
            <ul class="mb-0">
                <li>The NetIDs of the users should be in column "Username"</li>
                <li>NetIDs are also allowed to be in the form of netid@tudelft.nl</li>
                <li>The groupnames (case-sensitive) should be in column "GroupName"</li>
                <li>The file should have the extension .csv</li>
                <li>Max file size is 1MB</li>
            </ul>

        </b-alert>
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
    import notifications from '../../mixins/notifications'

    export default {
        mixins: [notifications],
        props: ['assignmentId'],
        data() {
            return {
                groupColumn: undefined,
                file: true,
                fileProgress: 0,
                uploadSuccess: null,
                acceptFiles: ".csv"
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
                try {
                    await api.client.post(`/assignments/${this.assignmentId}/importgroups`, formData)
                    this.showSuccessMessage()
                } catch (e) {
                    this.showErrorMessage({message: e.response.data.error})
                }
            }
        }

    }
</script>