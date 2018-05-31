<template>
    <div>
        <b-container>

            <h1 class="mt-5">Course dashboard</h1>

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
                         outlined
                         show-empty
                         stacked="md"
                         :items=assignments
                         :fields="fields"
                         :current-page="currentPage"
                         :per-page="perPage"
                         :filter="filter">
                    <template slot="filename" slot-scope="data">
                        <a :href="`/api/assignments/${data.item.id}/file`"> {{data.value}} </a>
                    </template>
                    <template slot="due_date" slot-scope="data"> {{ formatDate(data.value) }} </template>
                    <template slot="publish_date" slot-scope="data"> {{ formatDate(data.value) }} </template>

                    <template slot="actions" slot-scope="data">
                        <b-button size="sm"
                                  :to="{ name: 'teaching-assistant-dashboard.course.assignment', params: { assignmentId: data.item.id } }"
                                  class="mr-1">
                            Details
                        </b-button>
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
                fields: [
                    { key:'title', label:'Title' },
                    { key:'description', label:'Description' },
                    { key:'publish_date', label:'Publish date' },
                    { key:'due_date', label:'Due date' },
                    { key:'filename', label:'Download' },
                    { key:'actions', label:'Action' }
                ],
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
            },
            formatDate(date) {
                // Formats the date to a readable format for the UI.
                if (!(date instanceof Date)) date = new Date(date)
                return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
            }
        },
        async created() {
            // Fetch course information.
            let course = await api.getCourse(this.$route.params.courseId);
            let assignments = await api.getCourseAssignments(this.$route.params.courseId);

            console.log()
            // Assign fetched data.
            this.assignments = assignments.data;
            this.course = course.data;
        }
    }
</script>
