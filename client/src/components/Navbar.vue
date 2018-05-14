<template>
    <nav>
        <b-navbar toggleable="md" type="dark" variant="primary">
            <b-container>

                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

                <router-link :to="{ name: 'LandingPage' }"><b-navbar-brand class="font-weight-bold">PR</b-navbar-brand></router-link>

                <b-collapse is-nav id="nav_collapse">

                    <b-navbar-nav>
                        <b-nav-item v-for="link in links" :to="link.to" exact> {{ link.text }} </b-nav-item>
                    </b-navbar-nav>

                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto">

                        <b-nav-item-dropdown right>
                            <!-- Using button-content slot -->
                            <template slot="button-content">
                                <span class="p-3">Sample User</span>
                            </template>
                            <b-dropdown-item href="#">Profile</b-dropdown-item>
                            <b-dropdown-item href="#">Sign-out</b-dropdown-item>
                        </b-nav-item-dropdown>

                    </b-navbar-nav>

                </b-collapse>
            </b-container>
        </b-navbar>
    </nav>
</template>

<script>
export default {
    props: ['links']
}
</script>
