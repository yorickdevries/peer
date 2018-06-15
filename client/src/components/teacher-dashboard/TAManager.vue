<template>
    <b-container>

        <!--Header-->
        <BreadcrumbTitle :items="['TA Management']" class="mt-3"></BreadcrumbTitle>

        <b-row>
            <b-col>

                    <b-card header="Teaching Assistants">
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

                            <template slot="actions" slot-scope="data">
                                <b-button @click="removeTA(data.item.user_netid)" size="sm" variant="danger">Remove
                                </b-button>
                            </template>
                        </b-table>

                        <!--Pagination-->
                        <b-pagination :total-rows=this.teachingAssistants.length :per-page="Number(perPage)"
                                      v-model="currentPage" class="my-0"/>
                    </b-card>

                </b-col>

                <!--Add form for TA-->
                <b-col cols="4">
                    <b-card class="mb-3" header="Add a teaching assistant">
                        <label>NetID</label>
                        <div class="input-group">
                            <b-form-input v-model="netid"></b-form-input>
                            <div class="input-group-append">
                                <b-button @click="submitTA" variant="primary" size="sm">Add</b-button>
                            </div>
                        </div>
                        <small class="form-text text-muted">Please input a valid netID.</small>
                    </b-card>
                </b-col>

            </b-row>
    </b-container>
</template>

<script>
import api from '../../api'
import notifications from '../../mixins/notifications'
import BreadcrumbTitle from '../BreadcrumbTitle'

export default {
    mixins: [notifications],
    components: {BreadcrumbTitle},
    data() {
        return {
            teachingAssistants: [],
            currentPage: 1,
            fields: [
                {key: 'user_netid', label: 'NetID'},
                'actions'
            ],
            perPage: 5,
            filter: null,
            netid: ""
        }
    },
    async created() {
        await this.fetchTeachingAssistants()
    },
    methods: {
        async submitTA() {
            // Check if input has been filled in.
            if (this.netid === "") return this.showErrorMessage({message: "Please input a valid netID."})

            // Change the role through the API.
            try {
                await api.client.put(`courses/${this.$route.params.courseId}/setRole`, {
                    netid: this.netid,
                    role: "TA"
                })
            } catch (e) {
                return this.showErrorMessage({message: "Something went wrong adding the TA."})
            }

            // Show correct status message.
            this.showSuccessMessage({message: `Successfully added ${this.netid} as a teaching assistant.`})

            // Re-fetch teaching assistants.
            await this.fetchTeachingAssistants()
        },
        async removeTA(netid) {
            // Change the role through the API.
            try {
                await api.client.put(`courses/${this.$route.params.courseId}/setRole`, {
                    netid: netid,
                    role: "student"
                })
            } catch (e) {
                console.log(e)
                return this.showErrorMessage({message: "Something went wrong removing the TA."})
            }

            // Show correct status message.
            this.showSuccessMessage({message: `Successfully added ${this.netid} as a teaching assistant.`})

            // Re-fetch teaching assistants.
            await this.fetchTeachingAssistants()
        },
        async fetchTeachingAssistants() {
            let {data} = await api.getUsersWithRole(this.$route.params.courseId, "TA")
            this.teachingAssistants = data
        }
    },
}
</script>
