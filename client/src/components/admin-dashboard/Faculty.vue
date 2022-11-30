<template>
    <div>
        <b-form-group label="Code" description="The faculty code.">
            <b-form-input v-model="faculty.name" type="text" />
        </b-form-group>
        <b-form-group label="Name" description="The faculty name.">
            <b-form-textarea v-model="faculty.longName" />
        </b-form-group>
        <b-button @click="save" size="sm">Save</b-button>
    </div>
</template>

<script>
import api from "@/api/api"
import notifications from "@/mixins/notifications"

export default {
    name: "Faculty",
    mixins: [notifications],
    props: ["facultyId", "reset"],
    data() {
        return {
            faculty: {
                name: "",
                longName: ""
            }
        }
    },
    async created() {
        await this.fetchFaculty()
    },
    methods: {
        async fetchFaculty() {
            // load the faculty in case an id is passed
            if (this.facultyId) {
                const res = await api.faculties.getById(this.facultyId)
                this.faculty = res.data
            }
        },
        async postFaculty() {
            await api.faculties.post({
                name: this.faculty.name,
                longName: this.faculty.longName
            })
        },
        async patchFaculty() {
            await api.faculties.patch({
                id: this.faculty.id,
                name: this.faculty.name,
                longName: this.faculty.longName
            })
        },
        async save() {
            if (this.faculty.id) {
                await this.patchFaculty()
                this.showSuccessMessage({ message: "Successfully updated faculty" })
            } else {
                await this.postFaculty()
                this.showSuccessMessage({ message: "Successfully added faculty" })
            }
            if (this.reset) {
                this.faculty.name = ""
                this.faculty.longName = ""
            }
            this.$emit("save")
        }
    }
}
</script>
