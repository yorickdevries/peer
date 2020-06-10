<template>
    <div fluid>
        <!--Display existing groups-->
        <b-row>
            <b-col>
                <b-row>
                    <b-col cols="6" class="mb-3">
                        <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                            <b-input-group>
                                <b-form-input v-model="filter" placeholder="Type to search"></b-form-input>
                                <b-input-group-append>
                                    <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col cols="6">
                        <b-form-group horizontal label="Per page">
                            <b-form-input type="number" v-model="perPage"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>

                <!--Table-->
                <b-table
                    striped
                    outline
                    show-empty
                    stacked="md"
                    :items="groups"
                    :fields="fields"
                    :current-page="currentPage"
                    :per-page="Number(perPage)"
                    :filter="filter"
                >
                    <template slot="actions" slot-scope="row">
                        <!-- we use @click.stop here to prevent emitting of a 'row-clicked' event  -->
                        <b-button size="sm" @click.stop="showDetails(row)" class="mr-2">
                            {{ row.detailsShowing ? "Hide" : "Show" }} Details
                        </b-button>
                    </template>
                    <template slot="row-details" slot-scope="row">
                        <b-card>
                            <b-row class="mb-2">
                                <b-col sm="3" class="text-sm"
                                    ><b>Group members</b>
                                    <p class="m-0" v-for="member in row.item.members" :key="member.user_netid">
                                        - {{ member.user_netid }}
                                    </p>
                                </b-col>
                            </b-row>
                        </b-card>
                    </template>
                </b-table>

                <!--Pagination-->
                <b-pagination
                    :total-rows="this.groups.length"
                    :per-page="Number(perPage)"
                    v-model="currentPage"
                    class="my-0"
                >
                </b-pagination>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import api from "../../api"

export default {
    data() {
        return {
            groups: [],
            currentPage: 1,
            fields: [
                { key: "id", label: "Group ID", sortable: true },
                { key: "group_name", label: "Group name", sortable: true },
                { key: "actions", label: "Actions" }
            ],
            filter: null,
            perPage: 10
        }
    },
    props: ["assignmentId"],
    async created() {
        try {
            let res = await api.getAssignmentGroups(this.assignmentId)
            this.groups = res.data
        } catch (e) {
            console.log(e)
        }
    },
    methods: {
        async showDetails(row) {
            row.toggleDetails()
            let res = await api.getUsersGroupById(row.item.id)
            this.$set(row.item, "members", res.data)
        }
    }
}
</script>
