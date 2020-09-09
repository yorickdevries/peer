<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Student Management']" class="mt-3"></BreadcrumbTitle>
        <b-row>
            <b-col>
                <b-card header="Student Manager">
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
                        :items="enrollments"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="Number(perPage)"
                        :filter="filter"
                    >
                    </b-table>

                    <!--Pagination-->
                    <b-pagination
                        :total-rows="this.enrollments.length"
                        :per-page="Number(perPage)"
                        v-model="currentPage"
                        class="my-0"
                    />
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"
import BreadcrumbTitle from "../BreadcrumbTitle"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle },
    data() {
        return {
            enrollments: [],
            // for navigation
            fields: [
                { key: "user.displayName", label: "Name" },
                { key: "user.netid", label: "NetID" },
                { key: "user.email", label: "​​​Email" },
                { key: "user.studentNumber", label: "Studentnumber" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        await this.fetchStudents()
    },
    methods: {
        async fetchStudents() {
            const res = await api.enrollments.get(this.$route.params.courseId, "student")
            this.enrollments = res.data
        }
    }
}
</script>
