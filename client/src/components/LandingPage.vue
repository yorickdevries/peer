<template>
    <div>

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
                        <b-card title="Login" class="w-75">
                            <p class="card-text">
                                <b-form>
                                    <b-form-input type="text" placeholder="Email address" class="my-2"></b-form-input>
                                    <b-form-input type="password" placeholder="Password"></b-form-input>
                                </b-form>
                            </p>

                            <router-link to="/dashboard/"><b-button variant="primary" class="w-100">Login</b-button></router-link>

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


        <footer class="text-muted fixed-bottom">
            <div class="container">
                <p class="float-right">
                    <a href="#">Back to top</a>
                </p>
                <p>In development. </p>
            </div>
        </footer>

    </div>
</template>

<script>
export default {
    name: "LandingPage"
}
</script>

<style scoped>
.bg-landing-page {
    background-color: #28b3ff;
}
footer {
    padding-top: 3rem;
    padding-bottom: 3rem;
}

footer p {
    margin-bottom: .25rem;
}
</style>