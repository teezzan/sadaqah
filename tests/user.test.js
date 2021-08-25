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
})