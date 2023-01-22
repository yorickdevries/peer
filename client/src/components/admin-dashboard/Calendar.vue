<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Assignment Due Dates']" class="mt-3"></BreadcrumbTitle>
        <FullCalendar :options="calendarOptions"></FullCalendar>
    </b-container>
</template>

<script>
import FullCalendar from "@fullcalendar/vue"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import api from "@/api/api"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
export default {
    name: "Calendar",
    components: { BreadcrumbTitle, FullCalendar },
    data() {
        return {
            calendarOptions: {
                plugins: [
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin, // needed for dateClick
                ],
                headerToolbar: {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                },
                initialView: "dayGridMonth",
                editable: false,
                events: [],
            },
        }
    },
    async created() {
        await this.fetchDueDates()
    },
    methods: {
        async fetchDueDates() {
            const res = await api.deadlines.getDeadlines()
            for (let i = 0; i < res.data.length; i++) {
                this.calendarOptions.events.push({
                    title: res.data[i].name,
                    start: res.data[i].publishDate,
                    end: res.data[i].dueDate,
                })
            }
        },
    },
}
</script>
