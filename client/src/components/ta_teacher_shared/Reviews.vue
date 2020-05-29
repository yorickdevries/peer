<template>
    <div>

        <!--Table Options-->
        <b-row>
            <b-col cols="6" class="mb-3">
                <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                    <b-input-group class="mb-2">
                        <b-form-input v-model="filter" placeholder="Type to search"/>
                        <b-input-group-append>
                            <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                        </b-input-group-append>
                    </b-input-group>

                    <b-button-group class="mx-auto">
                        <button @click="setShowOnlyDoneReviews(undefined)"
                                :class="{'bg-primary': showOnlyDoneReviews === undefined, 'btn-outline-primary': showOnlyDoneReviews !== undefined, 'text-white': showOnlyDoneReviews === undefined}"
                                class="btn btn-sm" size="sm">All reviews
                        </button>
                        <button @click="setShowOnlyDoneReviews(true)"
                                :class="{'bg-primary': showOnlyDoneReviews === true, 'btn-outline-primary': showOnlyDoneReviews !== true, 'text-white': showOnlyDoneReviews === true}"
                                class="btn btn-sm" size="sm">Done reviews
                        </button>
                        <button @click="setShowOnlyDoneReviews(false)"
                                :class="{'bg-primary': showOnlyDoneReviews === false, 'btn-outline-primary': showOnlyDoneReviews !== false, 'text-white': showOnlyDoneReviews === false}"
                                class="btn btn-sm" size="sm">Not done reviews
                        </button>
                    </b-button-group>

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
                 :items=reviews
                 :fields="fields"
                 :current-page="currentPage"
                 :per-page="Number(perPage)"
                 :filter="filter">

            <template slot="done" slot-scope="row">
                <span v-if="row.item.done">Done</span>
                <span v-if="row.item.done === false">Not done</span>
            </template>

            <template slot="approved" slot-scope="row">
                <span v-if="row.item.approved">Approved</span>
                <span v-if="row.item.approved === false">Disapproved</span>
                <span v-if="row.item.approved === null">No action yet by any TA</span>
            </template>

            <template slot="ta_netid" slot-scope="row">
                <span v-if="row.item.ta_netid">{{ row.item.ta_netid }}</span>
                <span v-if="row.item.ta_netid === null">None</span>
            </template>

            <template slot="actions" slot-scope="row">
                <b-button variant="primary" size="sm" :to="{name: pathName, params: { reviewId: row.item.id }}">See review</b-button>
            </template>
        </b-table>

        <!--Pagination-->
        <b-pagination :total-rows=this.reviews.length :per-page="Number(perPage)" v-model="currentPage" class="my-0"/>
    </div>
</template>

<script>
    import api from "../../api"

    export default {
        props: ["assignmentId", "pathName"],
        data() {
            return {
                reviews: [],
                allReviews: [],
                doneReviews: [],
                notDoneReviews: [],
                currentPage: 1,
                fields: [
                    {key: 'reviewer', label: 'Reviewer'},
                    {key: 'submitter', label: 'Submitter'},
                    {key: 'done', label: 'Status'},
                    {key: 'approved', label: 'Approval Status'},
                    {key: 'ta_netid', label: 'Graded by TA'},
                    {key: 'flagged', label: 'Reviewer reported the submission'},
                    'actions'
                ],
                perPage: 5,
                filter: null,
                showOnlyDoneReviews: undefined,
            }
        },
        async created() {
            let res = await api.getAssignmentReviews(this.assignmentId, undefined)
            this.allReviews = res.data
            this.reviews = res.data

            this.processReviews()
        },
        methods: {
            processReviews() {
              for (let i = 0; i < this.allReviews.length; i++) {
                  if (this.allReviews[i].done === true) {
                      this.doneReviews.push(this.allReviews[i])
                  } else {
                      this.notDoneReviews.push(this.allReviews[i])
                  }
              }
            },
            async setShowOnlyDoneReviews(state) {
                this.showOnlyDoneReviews = state
                if (state === undefined) {
                    this.reviews = this.allReviews
                } else if (state === true) {
                    this.reviews = this.doneReviews
                } else if (state === false) {
                    this.reviews = this.notDoneReviews
                }
            }
        }
    }
</script>
