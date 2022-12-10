<template>
    <nav class="shadow-sm">
        <!--Head Navbar-->
        <b-navbar toggleable="md" type="dark" class="py-3" :class="headNavbarClass">
            <b-container>
                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

                <!--Logo Image-->
                <router-link :to="{ name: 'landing-page' }"
                    ><b-navbar-brand class="font-weight-bold d-flex align-items-center"
                        ><img src="../assets/images/logo.svg" alt="logo" height="20px" class="mr-1 mb-1" />
                        <div>{{ siteName }}</div></b-navbar-brand
                    ></router-link
                >

                <!--Course/Role Text-->
                <h5 class="text-white font-weight-bold my-0">{{ title }}</h5>
                <b-badge v-if="role" variant="dark" class="ml-3 p-2"
                    ><span class="font-weight-bold">ROLE: {{ role.toUpperCase() }}</span></b-badge
                >

                <b-collapse is-nav id="nav_collapse">
                    <!-- Right aligned nav items -->
                    <b-navbar-nav v-if="authenticated" class="ml-auto">
                        <b-nav-item v-if="user.admin" :to="{ name: 'admin-dashboard.home' }" exact>
                            <icon name="lock" class="mr-2 align-middle"></icon>
                            <span class="align-middle">Admin</span>
                        </b-nav-item>
                        <b-nav-item :to="{ name: 'courses' }" exact>
                            <icon name="th-large" class="mr-2 align-middle"></icon
                            ><span class="align-middle">Courses</span>
                        </b-nav-item>

                        <b-nav-item-dropdown right>
                            <!-- Using button-content slot -->
                            <template slot="button-content">
                                <span class="p-3 align-middle">{{ user.displayName }}</span>
                            </template>
                            <b-dropdown-item v-b-modal.userinfo-modal>Userinfo</b-dropdown-item>
                            <b-modal id="userinfo-modal" hide-header hide-footer>
                                <UserInfo :user="user"></UserInfo>
                            </b-modal>
                            <b-dropdown-item href="/api/logout">Sign-out</b-dropdown-item>
                        </b-nav-item-dropdown>
                    </b-navbar-nav>

                    <b-navbar-nav v-else class="ml-auto">
                        <b-nav-item href="/api/login">Login</b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
            </b-container>
        </b-navbar>

        <!--Secondary (Course) Navbar-->
        <b-navbar toggleable="md" type="dark" :class="subNavbarClass">
            <b-container>
                <b-collapse is-nav id="nav_collapse">
                    <b-navbar-nav>
                        <b-nav-item v-for="link in links" :key="link.text" :to="link.to" exact>
                            {{ link.text }}</b-nav-item
                        >
                    </b-navbar-nav>
                </b-collapse>
            </b-container>
        </b-navbar>
    </nav>
</template>

<script>
import api from "../api/api"
import UserInfo from "./general/UserInfo"

export default {
    props: ["links", "title", "role", "variant"],
    components: { UserInfo },
    data() {
        return {
            authenticated: null,
            user: { name: null },
            currentCourse: "",
            siteName: process.env.NODE_ENV === "production" ? "Peer Review" : "Peer Review Development",
            bannerBuffer: 10, //must be in seconds
            bannerInterval: null,
            curTime: null
        }
    },
    computed: {
        headNavbarClass() {
            switch (this.variant) {
                case "primary":
                    return { "bg-primary": true }
                case "success":
                    return { "bg-success": true }
                case "danger":
                    return { "bg-danger": true }
                case "warning":
                    return { "bg-warning": true }
                default:
                    return { "bg-primary": true }
            }
        },
        subNavbarClass() {
            switch (this.variant) {
                case "primary":
                    return { "bg-primary-light": true }
                case "success":
                    return { "bg-success-light": true }
                case "danger":
                    return { "bg-danger-light": true }
                case "warning":
                    return { "bg-warning": true }
                default:
                    return { "bg-primary-light": true }
            }
        }
    },
    async mounted() {
        // Fetch authentication & user information.
        await this.refreshAuthenticated()
        if (this.authenticated) {
            await this.refreshMe()
        }

        await this.startBannerCheck()
    },
    destroyed() {
        clearInterval(this.bannerInterval)
    },
    methods: {
        async refreshAuthenticated() {
            // Refresh whether user is authenticated.
            const res = await api.getAuthenticated()
            this.authenticated = res.data.authenticated
        },
        async refreshMe() {
            // Refresh user information.
            const res = await api.getMe()
            this.user = res.data
        },
        async startBannerCheck() {
            const lastBannerCheckTime = localStorage.getItem("lastBannerCheckTime")
            this.curTime = Math.floor(Date.now() / 1000)

            if (lastBannerCheckTime === null) {
                //If banner was never checked, set regular interval and check
                this.bannerInterval = setInterval(this.refreshBanner, this.bannerBuffer * 1000)
                await this.refreshBanner()
            } else {
                const lastCheckTimeNum = Number(lastBannerCheckTime)

                if (lastCheckTimeNum + this.bannerBuffer < this.curTime) {
                    //If banner was last checked more than bannerBuffer sec(s) ago, set regular interval and check
                    this.bannerInterval = setInterval(this.refreshBanner, this.bannerBuffer * 1000)
                    await this.refreshBanner()
                } else {
                    //If banner was last checked less than bannerBuffer sec(s) ago, check when necessary and set regular interval
                    setTimeout(async () => {
                        this.bannerInterval = setInterval(this.refreshBanner, this.bannerBuffer * 1000)
                        await this.refreshBanner()
                    }, (lastCheckTimeNum + this.bannerBuffer - this.curTime) * 1000)
                }
            }
        },
        async refreshBanner() {
            this.curTime = Math.floor(Date.now() / 1000)
            localStorage.setItem("lastBannerCheckTime", this.curTime.toString())

            const res = await api.banners.get(true, true)
            this.banner = res.data
        }
    }
}
</script>
