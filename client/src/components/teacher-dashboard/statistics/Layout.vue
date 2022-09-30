<template>
    <div>
        <b-container>
            <!--Header-->
            <BreadcrumbTitle :items="['Statistics']" class="mt-3"></BreadcrumbTitle>

            <b-card no-body>
                <b-tabs card lazy class="mb-3">
                    <!--Details & Action-->
                    <b-tab title="Assignments" active ref="chartTab">
                        <AssignmentStatistics :enum="this.chartEnum.Assignment" />
                    </b-tab>
                </b-tabs>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import notifications from "@/mixins/notifications"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
import AssignmentStatistics from "@/components/teacher-dashboard/statistics/AssignmentStatistics"

export default {
    mixins: [notifications],
    components: { AssignmentStatistics, BreadcrumbTitle },
    name: "Statistics",
    data() {
        return {
            chartEnum: {
                Assignment: {
                    AVG_REVIEW_TIME: "avg_review_time",
                    TIME_SUBMIT_BEFORE_DEADLINE: "time_before_deadline",
                    NUM_OF_NO_REVIEWS: "num_no_reviews"
                }
            }
        }
    }
}
</script>
