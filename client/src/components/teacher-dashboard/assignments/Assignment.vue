<template>
    <div>
        <b-container>

            <b-row>
                <b-col>
                    <h1 class="mt-5">{{assignment.title}}</h1>
                </b-col>
            </b-row>

            <b-row>
                <b-col>
                    <b-card no-body>
                        <b-card-body>
                            <h4 class="card-title mb-0">Details</h4>
                        </b-card-body>
                        <b-list-group flush>
                            <b-list-group-item class="flex-column align-items-start">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">Description</h5>
                                </div>
                                <p class="mb-1">
                                    {{assignment.description}}
                                </p>
                            </b-list-group-item>
                            <b-list-group-item class="flex-column align-items-start">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">Publish date</h5>
                                </div>
                                <p class="mb-1">
                                    {{formatDate(assignment.publish_date)}}
                                </p>
                            </b-list-group-item>
                            <b-list-group-item class="flex-column align-items-start">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">Due date</h5>
                                </div>
                                <p class="mb-1">
                                    {{formatDate(assignment.due_date)}}
                                </p>
                            </b-list-group-item>
                        </b-list-group>
                    </b-card>
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
import api from '../../../api'

export default {
    async created() {
        let aid = this.$route.params.assignmentId
        this.aid = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data
    },
    data() {
        return {
            // cid: null,
            aid: null,
            assignment: {

            },
        }
    },
    methods: {
        formatDate(date) {
            // Formats the date to a readable format for the UI.
            if (!(date instanceof Date)) date = new Date(date)
            return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`
        }
    }
}
</script>
