<template>
    <b-container>

        <!--Header-->
        <BreadcrumbTitle :items="['Student Management']" class="mt-3"></BreadcrumbTitle>

        <b-card>
            <b-row>
                <b-col>

                    <!--Table Options-->
                    <b-row>
                        <b-col cols="6" class="mb-3">
                            <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                                <b-input-group>
                                    <b-form-input v-model="filter" placeholder="Type to search"/>
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
                             :items="students"
                             :fields="fields"
                             :current-page="currentPage"
                             :per-page="Number(perPage)"
                             :filter="filter">

                    </b-table>

                    <!--Pagination-->
                    <b-pagination :total-rows=this.students.length :per-page="Number(perPage)"
                                  v-model="currentPage" class="my-0"/>

                </b-col>

            </b-row>
        </b-card>
    </b-container>
</template>

<script>
    import api from '../../api'
    import BreadcrumbTitle from '../BreadcrumbTitle'

    export default {
        components: {BreadcrumbTitle},
        data() {
            return {
                students: [],
                currentPage: 1,
                fields: [
                    {key: 'user_netid', label: 'NetID'},
                ],
                perPage: 5,
                filter: null,
                netid: ""
            }
        },
        async created() {
            await this.fetchStudents()
        },
        methods: {
            async fetchStudents() {
                try {
                    let res = await api.getUsersWithRole(this.$route.params.courseId, "student")
                    this.students = res.data
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
</script>
