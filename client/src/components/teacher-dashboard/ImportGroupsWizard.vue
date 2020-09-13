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
            <b-form-file
                v-model="file"
                accept=".csv"
                placeholder="Choose a .csv file..."
                required
                :state="Boolean(file)"
            >
            </b-form-file>
            <b-button variant="primary" class="mt-3" @click="importGroups">Import groups</b-button>
        </b-form-group>
    </b-card>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"

export default {
    mixins: [notifications],
    data() {
        return {
            file: null
        }
    },
    methods: {
        async importGroups() {
            await api.groups.import(this.$route.params.assignmentId, this.file)
            this.showSuccessMessage({ message: "Groups are being imported" })
        }
    }
}
</script>
