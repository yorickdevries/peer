<template>
    <b-container>
        <!--Header-->
        <BreadcrumbTitle :items="['Banner Management']" class="mt-3"></BreadcrumbTitle>
        <b-row>
            <b-col>
                <b-card header="Banner Management">
                    <!--Table Options-->
                    <b-row>
                        <b-col cols="6" class="mb-3">
                            <b-form-group horizontal label="Filter" class="mb-0 mr-4">
                                <b-input-group>
                                    <b-form-input v-model="filter" debounce="1000" placeholder="Type to search" />
                                    <b-input-group-append>
                                        <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form-group>
                        </b-col>
                        <b-col cols="6">
                            <b-form-group horizontal label="Per page">
                                <b-form-input type="number" v-model="perPage" />
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <!--Table-->
                    <b-table
                        striped
                        outlined
                        show-empty
                        stacked="md"
                        :items="banners"
                        :fields="fields"
                        :current-page="currentPage"
                        :per-page="Number(perPage)"
                        :filter="filter"
                    >
                        <template v-slot:cell(action)="data">
                            <div class="d-flex">
                                <b-btn v-b-modal="`edit${data.item.id}`" size="sm" class="mr-1">Edit </b-btn>
                                <b-btn v-b-modal="`delete${data.item.id}`" variant="danger" size="sm">Delete</b-btn>
                            </div>
                            <b-modal :id="`delete${data.item.id}`" centered title="Warning" @ok="remove(data.item.id)">
                                Are you sure you want to delete the banner "{{ data.item.title }}"? <br /><br />
                                If this banner is active, users will no longer see this banner displayed.
                            </b-modal>
                            <b-modal :id="`edit${data.item.id}`" centered hide-footer class="p-0 m-0" title="Edit">
                                <Banner :id="data.item.id" @save="save(data.item.id)" />
                            </b-modal>
                        </template>
                    </b-table>

                    <!--Pagination-->
                    <b-pagination
                        :total-rows="this.banners.length"
                        :per-page="Number(perPage)"
                        v-model="currentPage"
                        class="my-0"
                    />
                </b-card>
            </b-col>
            <b-col cols="4">
                <b-card class="mb-3" header="Add a banner">
                    <Banner @save="save" :reset="true" />
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import notifications from "@/mixins/notifications"
import BreadcrumbTitle from "@/components/BreadcrumbTitle"
import api from "@/api/api"
import Banner from "@/components/admin-dashboard/Banner"

export default {
    name: "BannerManager",
    mixins: [notifications],
    components: { Banner, BreadcrumbTitle },
    data() {
        return {
            banners: [],
            // for navigation
            fields: [
                { key: "id", label: "ID", sortable: true },
                { key: "title", label: "Title" },
                { key: "text", label: "Text" },
                { key: "active", label: "Active" },
                { key: "action", label: "Action" },
            ],
            currentPage: 1,
            perPage: 10,
            filter: "",
        }
    },
    async created() {
        await this.fetch()
    },
    methods: {
        async fetch() {
            const res = await api.banners.get()
            this.banners = res.data
        },
        async save(id) {
            await this.fetch()
            if (id) {
                this.$bvModal.hide(`edit${id}`)
            }
        },
        async remove(id) {
            await api.banners.delete(id)
            await this.fetch()
            this.showSuccessMessage({ message: "Banner has been removed" })
        },
    },
}
</script>
