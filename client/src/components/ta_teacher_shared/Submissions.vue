<template>
    <div>

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
                 :items=submissions
                 :fields="fields"
                 :current-page="currentPage"
                 :per-page="Number(perPage)"
                 :filter="filter">

            <template slot="file_path" slot-scope="data">
                <a :href="`/api/submissions/${data.item.id}/file`"> {{data.value }} </a>
            </template>

            <template slot="actions" slot-scope="row">
                <b-button @click.stop="row.toggleDetails">{{ row.detailsShowing ? "Hide Comments" : "Show Comments"}}
                </b-button>
            </template>

            <template slot="row-details" slot-scope="row">
                <SubmissionCommentWizard>

                </SubmissionCommentWizard>
            </template>

        </b-table>

        <!--Pagination-->
        <b-pagination :total-rows=this.submissions.length :per-page="Number(perPage)" v-model="currentPage"
                      class="my-0"/>
    </div>
</template>

<script>
    import api from "../../api"
    import SubmissionCommentWizard from './SubmissionCommentsWizard'

    export default {
        components: {SubmissionCommentWizard},
        props: ["assignmentId"],
        data() {
            return {
                submissions: [],
                currentPage: 1,
                fields: [
                    {key: 'user_netid', label: 'Username'},
                    {key: 'date', label: 'Submitted'},
                    {key: 'file_path', label: 'Download'},
                    'actions'
                ],
                perPage: 5,
                filter: null
            }
        },
        async created() {
            let res = await api.getAssignmentAllSubmissions(this.assignmentId);
            this.submissions = res.data
        }
    }
</script>