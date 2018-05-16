<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">Dashboard</h1>
                    <b-breadcrumb :items="crumbs"/>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-card no-body>
                        <template slot="header">Upcoming Assignments</template>
                        <b-table sort-by="Due-Date" responsive striped hover :items="items" :fields="fields"></b-table>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
export default {
    name: "student-dashboard.index",
    data() {
        return {
            crumbs: [
                {
                    text: 'Dashboard',
                    to: { name: 'student-dashboard.indexPage'},
                    active: true
                }
            ],
            fields: [
                {
                    key: 'Course',
                    sortable: false
                },
                {
                    key: 'Assignment',
                    sortable: false
                },
                {
                    key: 'Action',
                    sortable: false
                },
                {
                    key: 'Due-Date',
                    sortable: true
                },
            ],
            items: [
                { Course: 'ADS', Assignment: 'Assignment 1', Action: 'Hand-in', 'Due-Date': '20 Nov. 23:49' },
                { Course: 'ADS', Assignment: 'Assignment 2', Action: 'Hand-in', 'Due-Date': '21 Nov. 23:49' },
                { Course: 'ADS', Assignment: 'Assignment 3', Action: 'Hand-in', 'Due-Date': '22 Nov. 23:49' },
            ]
        }
    }
}
</script>
