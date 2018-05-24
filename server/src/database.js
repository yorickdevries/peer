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
var bluebird_1 = require("bluebird");
var is_ci_1 = require("is-ci");
var pg_promise_1 = require("pg-promise");
var Database = /** @class */ (function () {
    function Database() {
    }
    Database.initialize = function () {
        var options = {
            // Initialization Options
            promiseLib: bluebird_1.default
        };
        var pgpObject = pg_promise_1.default(options);
        this.connection = {
            user: "postgres",
            host: "localhost",
            database: "peer_database",
            password: "password",
            port: 5432
        };
        if (is_ci_1.default) {
            console.log("The code is running on a CI server");
            this.connection.host = "postgres";
        }
        this.db = pgpObject(this.connection);
    };
    /**
     * Method to import default database.
     * @param {pgPromise.QueryFile} qf - a pgp queryfile.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
    Database.DatabaseImport = function (qf) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.any("DROP SCHEMA IF EXISTS public CASCADE")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.any("CREATE SCHEMA public")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.db.any(qf)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
    Database.executeQuery = function (statement) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Database.db.any(statement)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        return [2 /*return*/, {
                                statement: statement,
                                error: "There was a problem executing the information to the database."
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
    Database.executeQuerySingleResult = function (statement) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Database.db.one(statement)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        return [2 /*return*/, {
                                statement: statement,
                                error: "There was a problem executing the information to the database."
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Database;
}());
exports.default = Database;
Database.initialize();
