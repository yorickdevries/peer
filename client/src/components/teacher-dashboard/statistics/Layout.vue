<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Statistics']" class="mt-3"></BreadcrumbTitle>

            <b-card no-body>
                <b-tabs card lazy class="mb-3">
                    <!--Details & Action-->
                    <b-tab title="Assignments" active ref="chartTab">
                        <label>Select an assignment</label>
                        <b-form-select class="mb-2" v-model="selectedAssignment" :disabled="loading" @change="selected">
                            <b-form-select-option
                                v-for="assignment in assignments"
                                :key="assignment.id"
                                :value="assignment.id"
                                >{{ assignment.id }} - {{ assignment.name }}</b-form-select-option
                            >
                        </b-form-select>
                        <label>Select a chart type</label>
                        <b-form-select
                            class="mb-2"
                            v-model="selectedChart"
                            :disabled="loading"
                            @change="selected"
                            :options="chartTypes"
                        >
                        </b-form-select>
                        <template v-if="renderChart">
                            <template v-if="selectedChart === this.chartEnum.AVG_REVIEW_TIME">
                                <AverageTimeChart :data="chartData" />
                            </template>
                            <template v-if="selectedChart === this.chartEnum.TIME_SUBMIT_BEFORE_DEADLINE">
                                <TimeBeforeDeadlineSubmissionChart :data="chartData" />
                            </template>
                        </template>
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import notifications from "@/mixins/notifications"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
import api from "@/api/api"
import AverageTimeChart from "@/components/teacher-dashboard/statistics/AverageTimeChart"
import TimeBeforeDeadlineSubmissionChart from "@/components/teacher-dashboard/statistics/TimeBeforeDeadlineSubmissionChart"

const chartEnum = {
    AVG_REVIEW_TIME: "avg_review_time",
    TIME_SUBMIT_BEFORE_DEADLINE: "time_before_deadline"
}

export default {
    mixins: [notifications],
    components: { TimeBeforeDeadlineSubmissionChart, AverageTimeChart, BreadcrumbTitle },
    name: "Statistics",
    computed: {
        renderChart() {
            return this.selectedAssignment !== null && this.selectedChart !== null && !this.loading && this.chartData
        }
    },
    data() {
        return {
            chartEnum: {
                AVG_REVIEW_TIME: "avg_review_time",
                TIME_SUBMIT_BEFORE_DEADLINE: "time_before_deadline"
            },
            assignments: [],
            loading: false,
            selectedAssignment: null,
            selectedChart: null,
            chartData: null,
            chartTypes: [
                { value: chartEnum.AVG_REVIEW_TIME, text: "Average time spent per review" },
                { value: chartEnum.TIME_SUBMIT_BEFORE_DEADLINE, text: "Time before deadline submitted" }
            ]
        }
    },
    async created() {
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        this.assignments = res.data
    },
    methods: {
        async fetchData() {
            let res = await api.statistics.assignments.get(this.selectedAssignment, this.selectedChart)
            this.chartData = res.data
        },
        selected() {
            if (this.selectedChart !== null && this.selectedAssignment !== null) {
                this.loading = true
                this.chartData = null
                this.fetchData().then(() => {
                    this.loading = false
                })
            }
        }
    }
}
</script>
