<template>
    <nav>
        <b-navbar toggleable="md" type="dark"  class="py-3 bg-primary">
            <b-container>

                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

                <router-link :to="{ name: 'landing-page' }"><b-navbar-brand class="font-weight-bold ">PR</b-navbar-brand></router-link>

                <h5 class="text-white font-weight-bold my-0">{{ title }}</h5>

                <b-collapse is-nav id="nav_collapse">

                    <!-- Right aligned nav items -->
                    <b-navbar-nav v-if="authenticated" class="ml-auto">
                        <b-nav-item :to="{ name: 'student-dashboard.courses' }" exact>
                            <icon name="th-large" class="mr-2 align-middle"></icon><span class="align-middle">Courses</span>
                        </b-nav-item>

                        <b-nav-item-dropdown right>
                            <!-- Using button-content slot -->
                            <template slot="button-content">
                                <span class="p-3 align-middle">{{ user.name }}</span>
                            </template>
                            <b-dropdown-item href="/api/logout">Sign-out</b-dropdown-item>
                        </b-nav-item-dropdown>

                    </b-navbar-nav>

                    <b-navbar-nav v-else="authenticated" class="ml-auto">
                        <b-nav-item href="/api/login">Login</b-nav-item>
                    </b-navbar-nav>


                </b-collapse>
            </b-container>
        </b-navbar>

        <b-navbar toggleable="md" type="dark" class="bg-primary-light" v-if="loadSecondNavbar">
            <b-container>

                <b-collapse is-nav id="nav_collapse">
                    <b-navbar-nav>
                        <b-nav-item v-for="link in links" :key="link.text" :to="link.to" exact> {{ link.text }}</b-nav-item>
                    </b-navbar-nav>
                </b-collapse>

            </b-container>
        </b-navbar>

    </nav>
</template>

<script>
    import api from '../api'

    export default {
        props: ['links', 'title'],
        mounted() {
            this.refreshAuthenticated()
            this.refreshUser()
        },
        data() {
            return {
                authenticated: null,
                user: null,
                currentCourse: "TI1316: Algoritmen en Datastructuren"
            }
        },
        methods: {
            async refreshAuthenticated() {
                let res = await api.getAuthenticated()
                this.authenticated = res.data.authenticated
            },
            async refreshUser() {
                let res = await api.getUser()
                this.user = res.data.user
            }
        },
        computed: {
            loadSecondNavbar() {
                return !(this.links === null || this.links.length === 0)
            }
        }
    }
</script>
