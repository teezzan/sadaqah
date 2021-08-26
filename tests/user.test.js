let dotenv = require('dotenv');
dotenv.config();
const db = require('./db-handler')
beforeAll(async () => await db.connect())
afterEach(async () => await db.clearDatabase())
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

        await UserController.create(payload)
        try {
            let resp = await UserController.create(payload)
        }
        catch (err) {
            expect(err.status).toBe('error');
            expect(err.message).toBe('User Exists');
            expect(err.code).toBe(422);
        }


    })

    it('Login User', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        await UserController.create(payload);

        payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!"
        }

        let response = await UserController.login(payload)
        expect(response.token).toBeDefined();
        expect(response.user.email).toBe(payload.email);
        expect(response.user.id).toBeDefined();



    })

    it('Login User With Wrong PAssword', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        await UserController.create(payload);

        try {

            payload = {
                email: "teehazzan@email.com",
                password: "paswwe55151"
            }

            await UserController.login(payload)
        }
        catch (err) {
            expect(err.status).toBe('error');
            expect(err.message).toBe('Wrong Password');
            expect(err.code).toBe(401);
        }

    })

    it('Forget Password', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        await UserController.create(payload);


        payload = {
            email: "teehazzan@email.com"
        }

        let response = await UserController.forgetPassword(payload);
        expect(response.msg).toBeDefined();

    })

    it('Forget Password For Wrong User', async () => {

        payload = {
            email: "teehazzan@email.com"
        }
        try {

            let response = await UserController.forgetPassword(payload);
        }
        catch (err) {

            expect(err.status).toBe('error');
            expect(err.message).toBe('User Does not Exist');
            expect(err.code).toBe(401);
        }

    })

    it('Get User Details', async () => {
        let payload = {
            email: "teehazzan@email.com",
            password: "paswweo2300@#!",
            name: "Test User Tee"
        }
        let { user } = await UserController.create(payload);

        let response = await UserController.me({ user });
        expect(response.user.email).toBe(payload.email);
        expect(response.user.id).toBe(user.id);
        expect(response.user.account_number).toBeUndefined();
        expect(response.user.bank_name).toBeUndefined();
        expect(response.user.account_name).toBeUndefined();
        expect(response.user).toHaveProperty('contributions');
        expect(response.user).toHaveProperty('avatar');
        expect(response.user).toHaveProperty('subscriptions');

    })

}, 30000)