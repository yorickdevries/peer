import api from "../../src/routes/api";
import assignments from "../../src/routes/assignments";
import courses from "../../src/routes/courses";
import groups from "../../src/routes/groups";
import reviews from "../../src/routes/reviews";
import rubric from "../../src/routes/rubric";
import submissions from "../../src/routes/submissions";

/**
 * Class responsible for making a fake mocked logged in user for testing purposes.
 *
 * @export
 * @class MockLogin
 */
export default class MockLogin {

    /**
     * Adds sample data to all routers
     *
     * @static
     * @param {(string | undefined)} [netid=undefined]
     * @param {(string | undefined)} [email=undefined]
     * @memberof MockLogin
     */
    static initialize(netid: string | undefined = undefined, email: string | undefined = undefined) {
        this.initializeRouter(api, netid, email);
        this.initializeRouter(assignments, netid, email);
        this.initializeRouter(courses, netid, email);
        this.initializeRouter(groups, netid, email);
        this.initializeRouter(reviews, netid, email);
        this.initializeRouter(submissions, netid, email);
    }

    /**
     * Adds sample data to a router.
     *
     * @static
     * @param {*} router
     * @param {(string | undefined)} [netid=undefined]
     * @param {(string | undefined)} [email=undefined]
     * @returns
     * @memberof MockLogin
     */
    static initializeRouter(router: any, netid: string | undefined = undefined, email: string | undefined = undefined) {
        // Authenticated function
        if (router.request == undefined) {
            console.log("invalid router object");
            return;
        }
        // Set SSO userinfo
        if (netid == undefined) {
            router.request.isAuthenticated = function () {
                return false;
            };
        } else {
            // Set isAuthenticated to true
            router.request.isAuthenticated = function () {
                return true;
            };
            // Set userinfo
            router.request.user = {
                netid: netid,
                studentNumber: 1234567,
                firstName: "First",
                prefix: "and",
                lastName: "Last",
                email: email,
                function: "student",
                displayName: "First and Last"};
        }
    }
}
