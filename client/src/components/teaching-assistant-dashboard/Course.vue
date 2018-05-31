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
                         :current-page="currentPage"
                         :per-page=5
                         :filter="filter"
                         @filtered="onFiltered">

                    <template slot="name" slot-scope="row">{{row.value.first}} {{row.value.last}}</template>
                    <template slot="isActive" slot-scope="row">{{row.value?'Yes :)':'No :('}}</template>
                    <template slot="actions" slot-scope="row">
                        <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
                        <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
                            Info modal
                        </b-button>
                        <b-button size="sm" @click.stop="row.toggleDetails">
                            {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                        </b-button>
                    </template>
                    <template slot="row-details" slot-scope="row">
                        <b-card>
                            <ul>
                                <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
                            </ul>
                        </b-card>
                    </template>
                </b-table>

                <b-pagination :total-rows=assignmentsCount() :per-page=5 v-model="currentPage" class="my-0" />

                <!-- Info modal -->
                <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
                    <pre>{{ modalInfo.content }}</pre>
                </b-modal>
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
                members: ["User 1", "User 2", "User 3", "User 4", "User 5"],
                currentPage: 1,
                perPage: 5,
                pageOptions: [ 5, 10, 15, 25, 50 ],
                sortBy: null,
                sortDesc: false,
                sortDirection: 'asc',
                filter: null,
                modalInfo: { title: '', content: '' }
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
            info (item, index, button) {
                this.modalInfo.title = `Row index: ${index}`
                this.modalInfo.content = JSON.stringify(item, null, 2)
                this.$root.$emit('bv::show::modal', 'modalInfo', button)
            },
            resetModal () {
                this.modalInfo.title = ''
                this.modalInfo.content = ''
            },
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

            // Construct an assignment array with data that will be displayed.
            let assignmentsArray = [assignments.data.length];
            for (let i = 0; i < assignments.data.length; i++) {
                assignmentsArray[i] = {
                    title: assignments.data[i].title,
                    description: assignments.data[i].description,
                    due_date: assignments.data[i].due_date,
                    publish_date: assignments.data[i].publish_date,
                    filename: assignments.data[i].filename
                }
            }

            // Assign fetched data.
            this.assignments = assignmentsArray;
            this.course = course.data;
        }
    }
</script>
