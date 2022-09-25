<template>
    <div v-if="!loading && this.data.times">
        <apexchart width="100%" type="area" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script>
export default {
    props: ["data"],
    name: "TimeBeforeDeadlineSubmissionChart",
    data() {
        return {
            chartOptions: null,
            series: null,
            loading: true,
            deadline: null
        }
    },
    methods: {
        createBuckets() {
            const buckets = {}
            for (const rawDate of this.data.times) {
                const date = new Date(rawDate)
                date.setMinutes(0)
                date.setSeconds(0)
                const index = date.getTime()
                if (buckets[index] === undefined) {
                    buckets[index] = 0
                }
                buckets[index]++
            }
            return buckets
        },
        parseData() {
            const buckets = this.createBuckets()

            this.series = [
                {
                    name: "Number of submissions",
                    data: Object.keys(buckets).map(k => [Number(k), buckets[k]])
                }
            ]
            this.chartOptions = {
                chart: {
                    id: "area-datetime",
                    type: "area",
                    zoom: {
                        autoScaleYaxis: true
                    }
                },
                annotations: {
                    xaxis: [
                        {
                            x: new Date(this.data.deadline).getTime(),
                            borderColor: "#999",
                            yAxisIndex: 0,
                            label: {
                                show: true,
                                text: "Deadline",
                                style: {
                                    color: "#fff",
                                    background: "#775DD0"
                                }
                            }
                        }
                    ]
                },
                xaxis: {
                    type: "datetime",
                    title: {
                        text: "Time buckets (1hr, exclusive)"
                    },
                    labels: {
                        datetimeUTC: true
                    }
                },
                tooltip: {
                    x: {
                        format: "HH:mm dd/M"
                    }
                },
                yaxis: {
                    title: {
                        text: "Number of submissions"
                    }
                },
                title: {
                    text: "Assignment submission time before deadline (1hr buckets, exclusive)",
                    align: "left"
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [0, 100]
                    }
                }
            }
        }
    },
    mounted() {
        this.parseData()
        this.loading = false
    }
}
</script>
