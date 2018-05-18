<template>
    <div>

        <Navbar :links="navbarItems"></Navbar>

        <!--Head Section with Login Card-->
        <b-container class="bg-landing-page" fluid>

            <b-container>
                <b-row class="py-5">
                    <b-col>
                        <h1 class="display-5 font-weight-bold text-white">Peer Review done right.</h1>
                        <p class="lead text-light">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit tincidunt, commodo
                            mauris sit amet, euismod sem.
                            Donec luctus vulputate libero non pellentesque. Donec vel tellus magna. Praesent malesuada
                            dictum orci eu lacinia.
                        </p>
                    </b-col>

                    <b-col>
                        <b-card title="Dashboards" class="w-75">
                            <router-link to="/student-dashboard/"><b-button variant="primary" class="w-100 mt-1">Student Dashboard</b-button></router-link>
                            <router-link to="/teaching-assistant-dashboard/"><b-button variant="primary" class="w-100 mt-1">TA Dashboard</b-button></router-link>
                            <router-link to="/teacher-dashboard/"><b-button variant="primary" class="w-100 mt-1">Teacher Dashboard</b-button></router-link>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>

        </b-container>

        <!--Explaining Section-->
        <b-container class="bg-light" fluid>

            <b-container>
                <b-row class="py-5 mh-100">
                    <b-col>
                        <b-card title="Submit your assignment" header="Step 1.">
                            <p class="card-text">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit tincidunt, commodo
                                mauris sit amet, euismod sem.
                            </p>
                        </b-card>
                    </b-col>

                    <b-col>
                        <b-card title="Peer review your students" header="Step 2.">
                            <p class="card-text">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit tincidunt, commodo
                                mauris sit amet, euismod sem.
                            </p>
                        </b-card>
                    </b-col>

                    <b-col>
                        <b-card title="Review how you did!" header="Step 3.">
                            <p class="card-text">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id elit tincidunt, commodo
                                mauris sit amet, euismod sem.
                            </p>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>

        </b-container>

        <Footer></Footer>

    </div>
</template>

<script>
import Footer from '../Footer'
import Navbar from '../Navbar'

export default {
    name: "LandingPage",
    components: {
        Footer,
        Navbar
    },
    data() {
        return {
            navbarItems: null
        }
    }
}
</script>

<style scoped>
.bg-landing-page {
    background-color: #28b3ff;
}
</style>