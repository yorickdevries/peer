<template>
    <b-container>
        <b-card header="TA Management"
                class="mt-5">

            <b-row>
                <b-col>

                    <!--Table Options-->
                    <b-row>
                        <b-col cols="6" class="mb-3">
                            <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                                <b-input-group>
                                    <b-form-input v-model="filter" placeholder="Type to Search"/>
                                    <b-input-group-append>
                                        <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form-group>
                        </b-col>
                        <b-col cols="6">
                            <b-form-group horizontal label="Per page">
                                <b-form-input type="number" v-model="perPage"/>
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <!--Table-->
                    <b-table striped
                             outlined
                             show-empty
                             stacked="md"
                             :items=teachingAssistants
                             :fields="fields"
                             :current-page="currentPage"
                             :per-page="Number(perPage)"
                             :filter="filter">

                        <template slot="file_path" slot-scope="data">
                            <a :href="`/api/submissions/${data.item.id}/file`"> {{data.value}} </a>
                        </template>
                    </b-table>

                    <!--Pagination-->
                    <b-pagination :total-rows=this.teachingAssistants.length :per-page="Number(perPage)"
                                  v-model="currentPage" class="my-0"/>

                </b-col>

                <b-col cols="4">
                    <b-card class="mb-3" header="Add a teaching assistant">
                        <label>NetID</label>
                        <div class="input-group">
                            <b-form-input v-model="netId"></b-form-input>
                            <div class="input-group-append">
                                <b-button @click="submitTA" variant="primary" size="sm">Add</b-button>
                            </div>
                        </div>
                        <small class="form-text text-muted">Please input a valid netID.</small>
                    </b-card>
                </b-col>
            </b-row>
        </b-card>
    </b-container>
</template>

<script>
    import api from '../../api'
    import VueNotifications from "vue-notifications/src/main"

    export default {
        data() {
            return {
                teachingAssistants: [],
                currentPage: 1,
                fields: [
                    {key: 'reviewer', label: 'Reviewer'},
                    {key: 'submitter', label: 'Submitter'}
                ],
                perPage: 5,
                filter: null,
                netId: ""
            }
        },
        async created() {

        },
        methods: {
            submitTA() {
                // Check if input has been filled in.
                if (this.netId === "") this.showErrorMessage({message: "Please input a valid netID."})


            }
        },
        notifications: {
            showErrorMessage: {
                type: VueNotifications.types.error,
                title: 'Error',
                message: 'Error.'
            }
        }
    }
</script>
