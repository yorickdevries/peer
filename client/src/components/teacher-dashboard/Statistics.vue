<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Statistics']" class="mt-3"></BreadcrumbTitle>

            <b-card no-body>
                <b-tabs card lazy class="mb-3">
                    <!--Details & Action-->
                    <b-tab title="Assignments" active ref="chartTab">
                        <b-form-select class="mb-2" v-model="selectedAssignment" @change="selected">
                            <b-form-select-option
                                v-for="assignment in assignments"
                                :key="assignment.id"
                                :value="assignment.id"
                                >{{ assignment.id }} - {{ assignment.name }}</b-form-select-option
                            >
                        </b-form-select>
                        <b-form-select class="mb-2" v-model="selectedChart" @change="selected" :options="chartTypes">
                        </b-form-select>
                        <template v-if="renderChart">
                            <template v-if="selectedChart === 1">
                                <apexchart width="100%" type="bar" :options="chartOptions" :series="series"></apexchart>
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

export default {
    mixins: [notifications],
    components: { BreadcrumbTitle },
    name: "Statistics",
    computed: {
        renderChart() {
            return this.selectedAssignment !== null && this.selectedChart !== null && !this.loading
        }
    },
    data() {
        return {
            assignments: [],
            loading: true,
            selectedAssignment: null,
            selectedChart: null,
            chartTypes: [{ value: 1, text: "Average time spent per review" }],
            chartOptions: {
                chart: {
                    id: "vuechart-example"
                },
                xaxis: {
                    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
                }
            },
            series: [
                {
                    name: "series-1",
                    data: [30, 40, 35, 50, 49, 60, 70, 91]
                }
            ]
        }
    },
    async created() {
        const res = await api.assignments.getAllForCourse(this.$route.params.courseId)
        this.assignments = res.data
    },
    methods: {
        async fetchData() {
            console.log("fetch")
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
