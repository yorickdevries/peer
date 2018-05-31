<template>
    <div>
        <b-container>

            <h1 class="mt-5"> Course dashboard</h1>

            <b-card>
                <b-row>
                    <b-col md="6" class="my-1">
                        <b-form-group horizontal label="Filter" class="mb-0">
                            <b-input-group>
                                <b-form-input v-model="filter" placeholder="Type to Search" />
                                <b-input-group-append>
                                    <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col md="6" class="my-1">
                        <b-form-group horizontal label="Per page" class="mb-0">
                            <b-form-select :options="pageOptions" v-model="perPage" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-table striped
                         bordered
                         show-empty
                         stacked="md"
                         :items=assignments
                         :fields="fields"
                         :current-page="currentPage"
                         :per-page="perPage"
                         :filter="filter"
                         @filtered="onFiltered">

                    <template slot="filename" slot-scope="data">
                        <a :href="`/api/assignments/${data.item.id}/file`">
                            {{data.value}}
                        </a>
                    </template>
                </b-table>

                <b-pagination :total-rows=assignmentsCount() :per-page="perPage" v-model="currentPage" class="my-0" />

            </b-card>

        </b-container>
    </div>
</template>

<script>
    import api from "../../api"

    export default {
        data() {
            return {
                items: [
                    {
                        text: 'Course Home',
                        active: true
                    }
                ],
                assignments: [
                    {
                        id: null,
                        title: null,
                        description: null,
                        due_date: null,
                        publish_date: null,
                        filename: null
                    }
                ],
                course: {
                    name: null,
                    description: null
                },
                fields: [ 'title', 'description', 'due_date', 'publish_date', 'filename' ],
                currentPage: 1,
                perPage: 5,
                pageOptions: [ 5, 10, 15, 25, 50 ],
                filter: null,
            }
        },
        computed: {
            sortOptions () {
                // Create an options list from our fields
                return this.fields
                    .filter(f => f.sortable)
                    .map(f => { return { text: f.label, value: f.key } })
            }
        },
        methods: {
            assignmentsCount() {
                return this.assignments.length;
            }
            // ,
            // onFiltered (filteredItems) {
            //     // Trigger pagination to update the number of buttons/pages due to filtering
            //     this.totalRows = filteredItems.length
            //     this.currentPage = 1
            // }
        },
        async created() {
            // Fetch course information.
            let course = await api.getCourse(this.$route.params.id);
            let assignments = await api.getCourseAssignments(this.$route.params.id);

            // Assign fetched data.
            this.assignments = assignments.data;
            this.course = course.data;
        }
    }
</script>
