let dotenv = require('dotenv');
dotenv.config();
const db = require('./db-handler')
beforeAll(async () => await db.connect())
afterAll(async () => await db.closeDatabase())

let UserController = require("../src/app/controller/User");

describe('User Operations', () => {

    it('Create User from Email', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        let response = await UserController.create(payload)
        expect(response.token).toBeDefined();
        expect(response.user.email).toBe(payload.email);
        expect(response.user.name).toBe(payload.name);
    })

    it('Create User from Existing Email', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        UserController.create(payload).then(response => {
            expect(response).toBeUndefined();
        }).catch(err => {
            expect(err.status).toBe('error');
            expect(err.message).toBe('User Exists');
            expect(err.code).toBe(422);
        })


    })

    it('Login User', async () => {

        payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!"
        }

        UserController.login(payload).then(response => {
            expect(response).toBeDefined();
            console.log(response);
        })
    })

}, 30000)