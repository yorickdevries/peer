<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Faculty Management']" class="mt-3"></BreadcrumbTitle>
        <b-row>
            <b-col>
                <b-card header="Faculty Management">
                    <!--Table Options-->
                    <b-row>
                        <b-col cols="6" class="mb-3">
                            <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                                <b-input-group>
                                    <b-form-input v-model="filter" debounce="1000" placeholder="Type to search" />
                                    <b-input-group-append>
                                        <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form-group>
                        </b-col>
                        <b-col cols="6">
                            <b-form-group horizontal label="Per page">
                                <b-form-input type="number" v-model="perPage" />
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <!--Table-->
                    <b-table
                        striped
                        outlined
                        show-empty
                        stacked="md"
                        :items="faculties"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="Number(perPage)"
                        :filter="filter"
                    >
                        <template v-slot:cell(action)="data">
                            <div class="d-flex">
                                <b-btn v-b-modal="`edit${data.item.id}`" size="sm" class="mr-1">Edit </b-btn>
                                <b-btn v-b-modal="`delete${data.item.id}`" variant="danger" size="sm">Delete</b-btn>
                            </div>
                            <b-modal
                                :id="`delete${data.item.id}`"
                                centered
                                title="Warning"
                                @ok="removeFaculty(data.item.id)"
                            >
                                Are you sure you want to delete the faculty "{{ data.item.name }} -
                                {{ data.item.longName }}"? <br /><br />
                                Deletion will be blocked if this faculty is already used by another course.
                            </b-modal>
                            <b-modal :id="`edit${data.item.id}`" centered hide-footer class="p-0 m-0" title="Edit">
                                <Faculty :facultyId="data.item.id" @save="facultySaved(data.item.id)" />
                            </b-modal>
                        </template>
                    </b-table>

                    <!--Pagination-->
                    <b-pagination
                        :total-rows="this.faculties.length"
                        :per-page="Number(perPage)"
                        v-model="currentPage"
                        class="my-0"
                    />
                </b-card>
            </b-col>
            <b-col cols="4">
                <b-card class="mb-3" header="Add a faculty">
                    <Faculty @save="facultySaved" :reset="true" />
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import notifications from "@/mixins/notifications"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
import api from "@/api/api"
import Faculty from "@/components/admin-dashboard/Faculty"

export default {
    name: "FacultyManager",
    mixins: [notifications],
    components: { Faculty, BreadcrumbTitle },
    data() {
        return {
            faculties: [],
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "name", label: "Abbreviation", sortable: true },
                { key: "longName", label: "Name", sortable: true },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchFaculties()
    },
    methods: {
        async fetchFaculties() {
            const res = await api.faculties.get()
            this.faculties = res.data
        },
        async facultySaved(id) {
            await this.fetchFaculties()
            if (id) {
                this.$bvModal.hide(`edit${id}`)
            }
        },
        async removeFaculty(id) {
            await api.faculties.delete(id)
            await this.fetchFaculties()
            this.showSuccessMessage({ message: "Faculty has been removed" })
        }
    }
}
</script>
