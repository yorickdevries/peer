"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var UserPS = /** @class */ (function () {
    function UserPS() {
    }
    /**
     * Executes an 'add user query'.
     * @param {string} netId - a net id.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    UserPS.executeAddUser = function (netId, email) {
        this.addUser.values = [netId, email];
        return database_1.default.executeQuery(this.addUser);
    };
    /**
     * Executes a 'get user by user id' query.
     * @param {string} netId - an user id.
     * @return {any} a query result.
     */
    UserPS.executeGetUserById = function (netId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.getUserById.values = [netId];
                return [2 /*return*/, database_1.default.executeQuery(this.getUserById)];
            });
        });
    };
    /**
     * Executes a 'get user by email' query.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    UserPS.executeGetUserByEmail = function (email) {
        this.getUserByEmail.values = [email];
        return database_1.default.executeQuery(this.getUserByEmail);
    };
    /**
     * Executes a 'get courses ids by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    UserPS.executeGetCoursesIdById = function (userId) {
        this.getCoursesIdById.values = [userId];
        return database_1.default.executeQuery(this.getCoursesIdById);
    };
    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    UserPS.executeGetGroupsById = function (userId) {
        this.getGroupsById.values = [userId];
        return database_1.default.executeQuery(this.getGroupsById);
    };
    /**
     * Executes a 'get submission by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    UserPS.executeGetSubmissionById = function (userId) {
        this.getSubmissionsById.values = [userId];
        return database_1.default.executeQuery(this.getSubmissionsById);
    };
    /**
     * Executes a 'get review by user id' query.
     * @param {number} userId
     * @return {any} a query result.
     */
    UserPS.executeGetReviewById = function (userId) {
        this.getReviewsById.values = [userId];
        return database_1.default.executeQuery(this.getReviewsById);
    };
    UserPS.addUser = new pg_promise_1.PreparedStatement("add-user", 'INSERT INTO "userlist" ("netid", "email") VALUES ($1, $2)');
    UserPS.getUserById = new pg_promise_1.PreparedStatement("get-user-by-id", 'SELECT * FROM "userlist" WHERE "netid" LIKE $1');
    UserPS.getUserByEmail = new pg_promise_1.PreparedStatement("get-user-by-email", 'SELECT * FROM "userlist" WHERE "email" LIKE $1');
    UserPS.getCoursesIdById = new pg_promise_1.PreparedStatement("get-courses-by-id", 'SELECT * FROM "enroll" WHERE "user_netid" LIKE $1');
    UserPS.getGroupsById = new pg_promise_1.PreparedStatement("get-groups-by-id", 'SELECT * FROM "groupusers" WHERE "user_netid" LIKE $1');
    UserPS.getSubmissionsById = new pg_promise_1.PreparedStatement("get-submissions-by-id", 'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');
    UserPS.getReviewsById = new pg_promise_1.PreparedStatement("get-reviews-by-id", 'SELECT * FROM "review" WHERE "user_netid" LIKE $1');
    return UserPS;
}());
exports.default = UserPS;
