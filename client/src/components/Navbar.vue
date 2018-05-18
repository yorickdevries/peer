<template>
    <nav>
        <b-navbar toggleable="md" type="dark" variant="primary">
            <b-container>

                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

                <router-link :to="{ name: 'landing-page' }"><b-navbar-brand class="font-weight-bold">PR</b-navbar-brand></router-link>

                <b-collapse is-nav id="nav_collapse">

                    <b-navbar-nav>
                        <b-nav-item v-for="link in links" :to="link.to" exact> {{ link.text }} </b-nav-item>
                    </b-navbar-nav>

                    <!-- Right aligned nav items -->
                    <b-navbar-nav v-if="authenticated" class="ml-auto">

                        <b-nav-item-dropdown right>
                            <!-- Using button-content slot -->
                            <template slot="button-content">
                                <span class="p-3">{{ user.name }}</span>
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
    </nav>
</template>

<script>
import api from '../api'

export default {
    props: ['links'],
    mounted() {
        this.refreshAuthenticated()
        this.refreshUser()
    },
    data() {
        return {
            authenticated: null,
            user: null
        }
    },
    methods: {
        async refreshAuthenticated() {
            let res = await api.getAuthenticated()
            console.log(res)
            this.authenticated = res.data.authenticated
        },
        async refreshUser() {
            let res = await api.getUser()
            console.log(res.data.user)
            this.user = res.data.user
        },
    }
}
</script>
