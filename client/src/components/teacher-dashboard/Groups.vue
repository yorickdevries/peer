<template>
    <b-container>
        <!--Add groups modal-->
        <b-row>
            <b-col>
                <b-button v-b-modal="'importGroups'" variant="primary" class="w-100">Import groups</b-button>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-modal id="importGroups" centered hide-header hide-footer class="p-0 m-0">
                    <ImportGroupsWizard :assignmentId="this.assignmentId"></ImportGroupsWizard>
                </b-modal>
            </b-col>
        </b-row>


    </b-container>
</template>

<script>
    import ImportGroupsWizard from "./ImportGroupsWizard";

    export default {
        components: {
            ImportGroupsWizard
        },
        props: ['assignmentId']
    }
</script>

<style scoped>

</style>