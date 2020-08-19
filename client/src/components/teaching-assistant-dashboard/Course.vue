<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Courses']" class="mt-3"></BreadcrumbTitle>

            <!--Table Options-->
            <b-row>
                <b-col cols="6" class="mb-3">
                    <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                        <b-input-group>
                            <b-form-input v-model="filter" placeholder="Type to search" />
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
                :items="assignments"
                :fields="fields"
                :current-page="currentPage"
                :per-page="Number(perPage)"
                :filter="filter"
            >
                <template v-slot:cell(action)="data">
                    <b-button
                        size="sm"
                        :to="{
                            name: 'teaching-assistant-dashboard.course.assignment',
                            params: { assignmentId: data.item.id }
                        }"
                        >Details</b-button
                    >
                </template>
            </b-table>

            <!--Pagination-->
            <b-pagination
                :total-rows="this.assignments.length"
                :per-page="Number(perPage)"
                v-model="currentPage"
                class="my-0"
            />
        </b-container>
    </div>
</template>

<script>
import api from "../../api/api"
import BreadcrumbTitle from "../BreadcrumbTitle"
export default {
    components: { BreadcrumbTitle },
    data() {
        return {
            assignments: [],
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "name", label: "Name", sortable: true },
                { key: "description", label: "Description" },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        // Fetch assignments information.
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        this.assignments = res.data
    }
}
</script>
