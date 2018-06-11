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

        <!--Display existing groups-->
        <b-row class="mt-3">
            <b-col>

                <b-row>
                    <b-col cols="6" class="mb-3">
                        <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                            <b-input-group>
                                <b-form-input v-model="filter" placeholder="Type to search"></b-form-input>
                                <b-input-group-append>
                                    <b-btn :disabled="!filter" @click="filter=''">Clear</b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                </b-row>
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
        data() {
            return {
                filter: null
            }
        },
        props: ['assignmentId']
    }
</script>

<style scoped>

</style>