import ENV from "./env"
import {dbInit} from "mongo-registry"
import {registry} from "./dbRegistry"
import startExpress from "express-blueforest"

const errorMapper = err => {
    if (err.code === 11000) {
        err.status = 400
        err.body = {errorCode: 1, message: "L'élément existe déjà"}
    }
}

export default dbInit(ENV, registry)
    .then(startExpress(ENV, errorMapper))
    .catch(e => console.error("BOOT ERROR\n", e))
