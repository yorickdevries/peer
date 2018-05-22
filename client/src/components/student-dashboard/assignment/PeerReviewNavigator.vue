<template>
    <div>
        <b-container fluid class="">
            <b-row>

                <b-col class="pl-0">
                    <b-list-group>
                        <b-list-group-item :to="{ name: 'student-dashboard.assignment.peer-review.single', params: { peer_review_id: 1 } }">Peer #1 <b-badge class="float-right" variant="danger">TODO</b-badge></b-list-group-item>
                        <b-list-group-item :to="{ name: 'student-dashboard.assignment.peer-review.single', params: { peer_review_id: 2 } }">Peer #2 <b-badge class="float-right" variant="danger">TODO</b-badge></b-list-group-item>
                        <b-list-group-item :to="{ name: 'student-dashboard.assignment.peer-review.single', params: { peer_review_id: 3 } }">Peer #3 <b-badge class="float-right" variant="success">DONE</b-badge></b-list-group-item>
                    </b-list-group>
                </b-col>

                <!--Peer Review Assesement-->
                <b-col cols="9" class="pr-0">
                        <router-view :key="$route.fullPath"></router-view>
                </b-col>

            </b-row>
        </b-container>
    </div>
</template>

<script>

export default {

}
</script>
