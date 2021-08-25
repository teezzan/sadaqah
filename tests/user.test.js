let dotenv = require('dotenv');
dotenv.config();
const db = require('./db-handler')
beforeAll(async () => await db.connect())
// afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.closeDatabase())

let UserController = require("../src/app/controller/User")

describe('Create User', () => {
    it('Greetings', async () => {
        let response = await UserController.greet()
        expect(response.status).toBeDefined();
        expect(response.status).toBe("Hello World!!!")
    })

    it('Creates User from email', async () => {
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

    it('Creates User from Google', async () => {
        
    })

}, 30000)