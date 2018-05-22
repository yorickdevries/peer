//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');

// Router
let Router = require("express");
let router = Router();

chai.use(chaiHttp);
//Our parent block

describe('Books', () => {
    /*
      * Test the /GET route
      */
        it('it should GET all the books', (done) => {
            chai.request(router)
                .get('/api/user/')
                .end((err, res) => {
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });

});