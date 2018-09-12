import {run} from "express-blueforest"
import {objectNoEx, object} from "mongo-registry"
import jwt from "jsonwebtoken"
import {X_ACCESS_TOKEN} from "./headers"

export const mongoId = chain => chain.exists().withMessage("missing").isMongoId().withMessage("invalid mongo id").customSanitizer(objectNoEx)
export const gt = chain => chain.customSanitizer(o => {
    gt:o
})

export const userIdIn = field => (o, req) => {
    o[field] = object(jwt.decode(req.headers[X_ACCESS_TOKEN]).user._id)
    return o
}
export const userShortnameIn = field => (o, req) => {
    let user = jwt.decode(req.headers[X_ACCESS_TOKEN]).user
    o[field] = user.shortname || user.fullname
    return o
}

export const setCreationDate = o => {
    o.creationDate = new Date()
    return o
}

export const setModifDate = o => {
    o.modifDate = new Date()
    return o
}

export const removeUndefineds = o => {
    let keys = Object.keys(o)
    for (let i = 0; i < keys; i++) {
        if (!o[i]) delete o[i]
    }
    return o
}


