const bcrypt = require('bcrypt');
const { User } = require('../../../db');
class AuthService {
    /**
     * 
     * @param {string} firstname 
     * @param {string} lastname 
     * @param {string} username 
     * @param {string} email 
     * @param {string} password 
     */
    async register(firstname, lastname, username, email, password) {
        const passwordHash = await this.#generateHashAndSalt(password);
        const newUser = new User({
            username: username,
            name: {
                first: firstname,
                last: lastname
            },
            email: email,
            passwordHash: passwordHash,
            posts: []

        });
        const savedUser = await newUser.save()
        return savedUser;
    }
    /**
     * 
     * @param {string} password 
     * @returns {Promise<string>}
     */
    async #generateHashAndSalt(password) {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
}

module.exports = {
    AuthService
}