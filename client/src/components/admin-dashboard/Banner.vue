<template>
    <div>
        <b-form-group label="Title" description="The banner title.">
            <b-form-input v-model="banner.title" type="text" />
        </b-form-group>
        <b-form-group label="Text" description="The banner text.">
            <b-form-textarea v-model="banner.text" rows="3" maxlength="255" />
        </b-form-group>
        <b-form-group label="Active" description="If the banner is active.">
            <b-form-checkbox v-model="banner.active" />
        </b-form-group>
        <b-button @click="save" size="sm">Save</b-button>
    </div>
</template>

<script>
import api from "@/api/api"
import notifications from "@/mixins/notifications"

export default {
    name: "Banner",
    mixins: [notifications],
    props: ["id", "reset"],
    data() {
        return {
            banner: {
                title: "",
                text: "",
                active: false,
            },
        }
    },
    async created() {
        await this.fetch()
    },
    methods: {
        async fetch() {
            // load the banner in case an id is passed
            if (this.id) {
                const res = await api.banners.getById(this.id)
                this.banner = res.data
            }
        },
        async post() {
            await api.banners.post({
                title: this.banner.title,
                text: this.banner.text,
                active: this.banner.active,
            })
        },
        async patch() {
            await api.banners.patch({
                id: this.banner.id,
                title: this.banner.title,
                text: this.banner.text,
                active: this.banner.active,
            })
        },
        async save() {
            if (this.banner.id) {
                await this.patch()
                this.showSuccessMessage({ message: "Successfully updated banner" })
            } else {
                await this.post()
                this.showSuccessMessage({ message: "Successfully added banner" })
            }
            if (this.reset) {
                this.banner.title = ""
                this.banner.text = ""
                this.banner.active = false
            }
            this.$emit("save")
        },
    },
}
</script>
