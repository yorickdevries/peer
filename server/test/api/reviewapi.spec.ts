///<reference path="../../node_modules/@types/chai-http/index.d.ts"/>
//Require the dev-dependencies
import app from "../../src/app";

import chai = require('chai');

// Router
let Router = require("express");
let router = Router();

chai.use(require('chai-http'));

const expect = chai.expect;

describe('baseRoute', () => {

    // it('should be json', () => {
    //     return chai.request(app)
    //         .get('/api/login/')
    //         .then(res => {
    //             console.log(chai.request(app).get("/api/courses/"));
    //             expect(res.type).to.eql('application/json');
    //         });
    // });

});