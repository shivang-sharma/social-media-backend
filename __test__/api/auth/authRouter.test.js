const request = require("supertest");
const { app } = require("../../../app");

describe("POST /api/v1/auth/register", () => {
    it("should return 200 OK and a success message", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                firstname: 'TestFirstName',
                lastname: 'TestLastName',
                username: 'testusername',
                email: 'test@email.com',
                password: 'Test@2021',
            })
        const userObject = JSON.parse(response.body)
        expect(response.statusCode).toBe(200);
        expect(userObject.name.first).toBe('TestFirstName');
        expect(userObject.name.last).toBe('TestLastName');
        expect(userObject.username).toBe('testusername');
        expect(userObject.email).toBe('test@email.com');
        expect(Array.isArray(userObject.posts)).toBe(true);
        expect(userObject._id).not.toEqual(undefined)
    });
    it("should return 403 a error", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                firstname: 'TestFirstName',
                lastname: 'TestLastName',
                email: 'test@email.com',
                password: 'Test@2021',
            })
        expect(response.statusCode).toBe(403);
    });
});

describe("POST /api/v1/auth/login", () => {
    it("should return 200 OK and a success message", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                email: 'test@email.com',
                password: 'Test@2021',
            })
        // const userObject = JSON.parse(response.body)
        console.log(response.body)
        expect(response.statusCode).toBe(200);
    });
    it("should return 403 a error", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                firstname: 'TestFirstName',
                lastname: 'TestLastName',
                email: 'test@email.com',
                password: 'Test@2021',
            })
        expect(response.statusCode).toBe(403);
    });
});