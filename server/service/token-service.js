const jwt = require("jsonwebtoken");

const tokenModel = require("../models/token-model");

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '10m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const existingToken = await tokenModel.findOne({user: userId})

        if (existingToken) {
            existingToken.refreshToken = refreshToken;
            return existingToken.save();
        }

        const token = await tokenModel.create({user: userId, refreshToken});
        return token;
    }
}

module.exports = new TokenService();