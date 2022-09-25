<template>
    <div v-if="!loading">
        <apexchart width="100%" type="area" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script>
export default {
    props: ["data"],
    name: "TimeBucketChart",
    data() {
        return {
            chartOptions: null,
            series: null,
            loading: true
        }
    },
    methods: {
        createBuckets() {
            const buckets = {}
            for (const time of this.data) {
                const index = Math.floor(time / 10)
                if (buckets[index] === undefined) {
                    buckets[index] = 0
                }
                buckets[index]++
            }
            return buckets
        },
        parseData() {
            const averageTime = this.data.reduce((prev, cur) => prev + cur, 0) / this.data.length / 10
            const buckets = this.createBuckets()

            this.series = [
                {
                    name: "Number of reviewers",
                    data: Object.keys(buckets).map(k => [Number(k), buckets[k]])
                }
            ]
            this.chartOptions = {
                chart: {
                    id: "area",
                    type: "area",
                    zoom: {
                        autoScaleYaxis: true
                    }
                },
                annotations: {
                    xaxis: [
                        {
                            x: averageTime,
                            borderColor: "#999",
                            yAxisIndex: 0,
                            label: {
                                show: true,
                                text: "Average",
                                style: {
                                    color: "#fff",
                                    background: "#775DD0"
                                }
                            }
                        }
                    ]
                },
                xaxis: {
                    type: "numeric",
                    title: {
                        text: "Time range (minutes)"
                    },
                    labels: {
                        formatter: value => {
                            return Math.round(value * 10)
                        }
                    },
                    tooltip: {
                        formatter: value => {
                            return `${Math.round(value * 10)} <= x < ${Math.round((value + 1) * 10)}`
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: "Number of reviewers"
                    }
                },
                title: {
                    text: "Average Time Spent per Review (exclusive)",
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
    created() {
        this.parseData()
        this.loading = false
    }
}
</script>
