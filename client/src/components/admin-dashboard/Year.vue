<template>
    <div>
        <b-form-group label="Name" description="The year name.">
            <b-form-input v-model="year.name" type="text" />
        </b-form-group>
        <b-form-group label="Active" description="If the year is active.">
            <b-form-checkbox v-model="year.active" />
        </b-form-group>
        <b-button @click="save" size="sm">Save</b-button>
    </div>
</template>

<script>
import api from "@/api/api"
import notifications from "@/mixins/notifications"

export default {
    name: "Year",
    mixins: [notifications],
    props: ["yearId", "reset"],
    data() {
        return {
            year: {
                name: "",
                active: false
            }
        }
    },
    async created() {
        await this.fetchYears()
    },
    methods: {
        async fetchYears() {
            // load the year in case an id is passed
            if (this.yearId) {
                const res = await api.academicyears.getById(this.yearId)
                this.year = res.data
            }
        },
        async postYear() {
            await api.academicyears.post({
                name: this.year.name,
                active: this.year.active
            })
        },
        async patchYear() {
            await api.academicyears.patch({
                id: this.year.id,
                name: this.year.name,
                active: this.year.active
            })
        },
        async save() {
            if (this.year.id) {
                await this.patchYear()
                this.showSuccessMessage({ message: "Successfully updated year" })
            } else {
                await this.postYear()
                this.showSuccessMessage({ message: "Successfully added year" })
            }
            if (this.reset) {
                this.year.name = ""
                this.year.active = false
            }
            this.$emit("save")
        }
    }
}
</script>
