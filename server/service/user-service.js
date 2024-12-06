const UserModel = require('../models/user-model');
const bcrypt = require("bcrypt");
const {uuidV4} = require("mongodb/src/utils");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const userDto = require("../dtos/user-dto");

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
        }

        const hashPassword = bcrypt.hash(password, 3);
        const activationLink = uuidV4()

        const user = await UserModel.create({email, password: hashPassword, activationLink})

        await mailService.sendActivationMail(email, activationLink)

        const userDto = new UserDto(user)

        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }
}

module.exports = new UserService();