<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Teacher Management']" class="mt-3"></BreadcrumbTitle>
        <b-row>
            <b-col>
                <b-card header="Teacher Manager">
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
                        :items="enrollments"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="Number(perPage)"
                        :filter="filter"
                    >
                        <template v-slot:cell(action)="data">
                            <b-button
                                v-if="data.item.userNetid !== user.netid"
                                @click="deleteTeacher(data.item.userNetid)"
                                size="sm"
                                variant="danger"
                                >Remove
                            </b-button>
                        </template>
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

            <!--Add form for teacher-->
            <b-col cols="4">
                <b-card class="mb-3" header="Add a teacher">
                    <label>Search for NetID</label>
                    <div class="input-group">
                        <b-form-input v-model="queryNetid"></b-form-input>
                        <div class="input-group-append">
                            <b-button @click="findUser" variant="primary" size="sm">Find</b-button>
                        </div>
                    </div>
                    <small class="form-text text-muted">Please put in a valid netID.</small>
                    <UserInfo :user="selectedUser" v-if="selectedUser"></UserInfo>
                    <br />
                    <div v-if="selectedNetid">
                        <div v-if="!selectedUser">
                            No user with <b>{{ selectedNetid }}</b> has ever logged into Peer before, if you are sure
                            you have the right netID, you can click the button below
                        </div>
                        <b-button @click="addTeacher" variant="primary" size="sm"
                            >Add <b>{{ selectedNetid }}</b> as teacher</b-button
                        >
                    </div>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import api from "../../api/api"
import notifications from "../../mixins/notifications"
import BreadcrumbTitle from "../BreadcrumbTitle"
import UserInfo from "../general/UserInfo"

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle, UserInfo },
    data() {
        return {
            enrollments: [],
            // current logged in user
            user: null,
            // used to find a user from the database
            queryNetid: "",
            // user fetched from the database
            selectedNetid: "",
            selectedUser: null,
            // for navigation
            fields: [
                { key: "user.displayName", label: "Name" },
                { key: "user.netid", label: "NetID" },
                { key: "user.email", label: "​​​Email" },
                { key: "user.studentNumber", label: "Studentnumber" },
                { key: "action", label: "Action" }
            ],
            currentPage: 1,
            perPage: 10,
            filter: ""
        }
    },
    async created() {
        const res = await api.getMe()
        this.user = res.data
        await this.fetchTeachers()
    },
    methods: {
        async fetchTeachers() {
            const res = await api.enrollments.get(this.$route.params.courseId, "teacher")
            this.enrollments = res.data
        },
        async findUser() {
            if (!this.queryNetid) {
                return this.showErrorMessage({ message: "Please input a valid netID." })
            }
            try {
                const res = await api.users.get(this.queryNetid)
                this.selectedUser = res.data
                this.selectedNetid = this.selectedUser.netid
            } catch (error) {
                this.selectedUser = null
                this.selectedNetid = this.queryNetid
            }
            return
        },
        async addTeacher() {
            // Change the role through the API.
            await api.enrollments.post(this.$route.params.courseId, this.selectedNetid, "teacher")
            // Show correct status message.
            this.showSuccessMessage({ message: `Successfully added ${this.selectedNetid} as a teacher.` })
            // Re-fetch teachers.
            await this.fetchTeachers()
            // reset search fields
            this.queryNetid = ""
            this.selectedUser = null
            this.selectedNetid = ""
        },
        async deleteTeacher(netid) {
            return this.showErrorMessage({
                message: `At this moment deletion of user ${netid} is not supported, please contact the administrator to do this`
            })
        }
    }
}
</script>
