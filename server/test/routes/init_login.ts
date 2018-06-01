/**
 * Class responsible for making a fake logged in user ofr testing purposes.
 *
 * @export
 * @class InitLogin
 */
export default class InitLogin {
/**
 * Adds sample data to a router.
 *
 * @static
 * @param {*} router
 * @param {(string | undefined)} [netid=undefined]
 * @param {(string | undefined)} [email=undefined]
 * @returns
 * @memberof InitLogin
 */
static initialize(router: any, netid: string | undefined = undefined, email: string | undefined = undefined) {
        // Authenticated function
        if (router.request == undefined) {
            console.log("invalid router object");
            return;
        }
        // Set Okta userinfo
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
            router.request.userinfo = {
                sub: "1234567890",
                name: "Full Name Here",
                locale: "en-US",
                preferred_username: email,
                given_name: netid,
                family_name: "Achternaam",
                zoneinfo: "America/Los_Angeles",
                updated_at: 0
            };
        }
    }
}
