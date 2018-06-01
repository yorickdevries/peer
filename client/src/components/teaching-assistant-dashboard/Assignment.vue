<template>
    <div>
        <b-container>

            <h1 class="mt-5">Assignment dashboard</h1>

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
                         :items=submissions
                         :fields="fields"
                         :current-page="currentPage"
                         :per-page="perPage"
                         :filter="filter">

                    <template slot="file_path" slot-scope="data">
                        <a :href="`/api/submissions/${data.item.id}/file`"> {{data.value}} </a>
                    </template>

                    <template slot="table-caption">
                        Submissions for: {{assignment.title}} (due date: {{formatDate(assignment.due_date)}})
                    </template>
                </b-table>


                <b-pagination :total-rows=submissionsCount() :per-page="perPage" v-model="currentPage" class="my-0" />

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
            assignment: {
                title: "",
                due_date: ""
            },
            submissions: [
                {
                    user_netid: null,
                    date: null,
                    file_path: null
                }
            ],
            course: {
                name: null,
                description: null
            },
            fields: [
                { key: 'user_netid', label: 'Username' },
                { key: 'date', label: 'Submitted' },
                { key: 'file_path', label: 'Download' }
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
        submissionsCount() {
            return this.submissions.length;
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
        let submissions = await api.getAssignmentAllSubmissions(this.$route.params.assignmentId);
        let assignment = await api.getAssignment(this.$route.params.assignmentId);

        // Assign fetched data.
        this.course = course.data;
        this.submissions = submissions.data;
        this.assignment = assignment.data;
    }
}
</script>
