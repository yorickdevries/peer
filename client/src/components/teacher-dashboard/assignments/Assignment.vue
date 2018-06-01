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
                                    {{assignment.publish_date}}
                                </p>
                            </b-list-group-item>
                            <b-list-group-item class="flex-column align-items-start">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">Due date</h5>
                                </div>
                                <p class="mb-1">
                                    {{assignment.due_date}}
                                </p>
                            </b-list-group-item>
                            <!--<b-list-group-item class="flex-column align-items-start">-->
                                <!--<div class="d-flex w-100 justify-content-between">-->
                                    <!--<h5 class="mb-1">Number of reviews that each student needs to do</h5>-->
                                <!--</div>-->
                                <!--<p class="mb-1">-->
                                    <!--{{assignment.peer_review_cap}}-->
                                <!--</p>-->
                            <!--</b-list-group-item>-->
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
        // let cid = this.$route.params.id
        let aid = this.$route.params.assignmentId
        // this.cid = cid
        this.aid = aid
        let res = await api.getAssignment(aid)
        this.assignment = res.data
    },
    data() {
        return {
            // cid: null,
            id2: null,
            assignment: null,
        }
    }
}
</script>
