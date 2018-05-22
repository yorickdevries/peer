import router from "./api";
import app from "../app";
import {oidc} from "../express-oidc";

// Login/login-redirect route from OIDC
app.use(oidc.router);

router.get("/logout", (req: any, res) => {
    req.logout();
    res.redirect("/");
});

// Authentication route
router.get("/authenticated", function (req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

router.use('*', function(req: any, res, next) {
    next()
});

export default router;