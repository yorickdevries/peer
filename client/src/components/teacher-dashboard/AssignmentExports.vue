<template>
    <div v-if="assignmentExports">
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
            :items="assignmentExports"
            :fields="fields"
            :sort-by="'id'"
            :sort-desc="true"
            :current-page="currentPage"
            :per-page="Number(perPage)"
            :filter="filter"
        >
            <template v-slot:cell(file)="data">
                <a v-if="data.item.file" :href="getFilePath(data.item.id)" target="_blank">
                    {{ data.item.file.name }}{{ data.item.file.extension }}
                </a>
                <div v-else>File is not ready yet</div>
            </template>

            <template v-slot:cell(date)="data">
                {{ data.item.createdAt | formatDate }}
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination
            :total-rows="this.assignmentExports.length"
            :per-page="Number(perPage)"
            v-model="currentPage"
            class="my-0"
        />
    </div>
</template>

<script>
import api from "../../api/api"

export default {
    data() {
        return {
            assignmentExports: null,
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "userNetid", label: "User" },
                { key: "file", label: "File" },
                { key: "date", label: "​​​Date" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchAssignmentExports()
    },
    methods: {
        async fetchAssignmentExports() {
            const res = await api.assignmentexports.get(this.$route.params.assignmentId)
            this.assignmentExports = res.data
        },
        getFilePath(id) {
            return `/api/assignmentexports/${id}/file`
        }
    }
}
</script>
