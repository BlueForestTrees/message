import sha1 from 'sha1'
import jwt from "jsonwebtoken"
import {X_ACCESS_TOKEN} from "../../src/headers"
import {createObjectId} from "test-api-express-mongo"

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

export const god = {
    _id: createObjectId(),
    mail: "god@test.fr",
    shortname: "gotest",
    fullname: "God Test",
    wantSuscribeDate: new Date(),
    password: sha1("god_password"),
    confirmDate: new Date(),
    color: getRandomColor(),
    god: true
}

export const authGod = {[X_ACCESS_TOKEN]: jwt.sign({user: god}, "miracle", {expiresIn: "1d"})}

export const simple = {
    _id: createObjectId(),
    shortname: "simple Guy"
}
export const authSimple = {[X_ACCESS_TOKEN]: jwt.sign({user: simple}, "megasecret", {expiresIn: "1d"})}

export const database = {}