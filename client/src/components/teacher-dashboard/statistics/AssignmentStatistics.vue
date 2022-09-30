<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <label>Select an assignment</label>
                <b-form-select class="mb-2" v-model="selectedAssignment" :disabled="loading" @change="selected">
                    <b-form-select-option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id"
                        >{{ assignment.id }} - {{ assignment.name }}</b-form-select-option
                    >
                </b-form-select>
            </b-col>
            <b-col>
                <label>Select a chart type</label>
                <b-form-select
                    class="mb-2"
                    v-model="selectedChart"
                    :disabled="loading"
                    @change="selected"
                    :options="chartTypes"
                >
                </b-form-select>
            </b-col>
            <b-col>
                <label>Select a bucket size (minutes)</label>
                <b-form-input min="1" max="120" v-model="buckets" type="number" lazy></b-form-input>
            </b-col>
        </b-row>
        <template v-if="renderChart">
            <template v-if="selectedChart === this.enum.AVG_REVIEW_TIME">
                <AverageTimeChart :data="chartData" :buckets="bucketsProp" />
            </template>
            <template v-if="selectedChart === this.enum.TIME_SUBMIT_BEFORE_DEADLINE">
                <TimeBeforeDeadlineSubmissionChart :data="chartData" :buckets="bucketsProp" />
            </template>
        </template>
    </b-container>
</template>

<script>
import TimeBeforeDeadlineSubmissionChart from "@/components/teacher-dashboard/statistics/TimeBeforeDeadlineSubmissionChart"
import AverageTimeChart from "@/components/teacher-dashboard/statistics/AverageTimeChart"
import api from "@/api/api"
import _ from "lodash"

export default {
    name: "AssignmentStatistics",
    props: ["enum"],
    components: { TimeBeforeDeadlineSubmissionChart, AverageTimeChart },
    computed: {
        renderChart() {
            return this.selectedAssignment !== null && this.selectedChart !== null && !this.loading && this.chartData
        }
    },
    watch: {
        buckets: {
            handler() {
                this.debounce()
            }
        }
    },
    data() {
        return {
            assignments: [],
            loading: false,
            selectedAssignment: null,
            selectedChart: null,
            chartData: null,
            buckets: 10,
            bucketsProp: 10,
            chartTypes: [
                { value: this.enum.AVG_REVIEW_TIME, text: "Average time spent per review" },
                { value: this.enum.TIME_SUBMIT_BEFORE_DEADLINE, text: "Time before deadline submitted" }
            ]
        }
    },
    async created() {
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        this.assignments = res.data
    },
    methods: {
        debounce: _.debounce(function() {
            this.bucketsProp = this.buckets
        }, 500),
        async fetchData() {
            let res = await api.statistics.assignments.get(this.selectedAssignment, this.selectedChart)
            this.chartData = res.data
        },
        selected() {
            if (this.selectedChart !== null && this.selectedAssignment !== null) {
                this.loading = true
                this.fetchData().then(() => {
                    this.loading = false
                })
            }
        }
    }
}
</script>
