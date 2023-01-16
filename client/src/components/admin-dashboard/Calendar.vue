<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Assignment Due Dates']" class="mt-3"></BreadcrumbTitle>
        <full-calendar :events="events" :config="config"></full-calendar>
    </b-container>
</template>

<script>
import "fullcalendar/dist/fullcalendar.css"
import api from "@/api/api"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
export default {
    name: "Calendar",
    components: { BreadcrumbTitle },
    data() {
        return {
            events: [],
            config: {
                editable: false
            }
        }
    },
    async created() {
        await this.fetchDueDates()
    },
    methods: {
        async fetchDueDates() {
            const res = await api.deadlines.getDeadlines()
            for (let i = 0; i < res.data.length; i++) {
                this.events.push({ title: res.data[i].name, start: res.data[i].publishDate, end: res.data[i].dueDate })
            }
        }
    }
}
</script>
