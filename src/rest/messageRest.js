import {col} from "mongo-registry"
import {Router, run} from "express-blueforest"
import {mongoId, removeUndefineds, gt, setCreationDate, setModifDate, userIdIn, anyOf} from "../validations"
import {cols} from "../collections"
import {body, param, query} from 'express-validator/check'

const router = Router()
module.exports = router

const messages = col(cols.MESSAGES)

router.post('/api/message',
    mongoId(body("_id")),
    mongoId(body("topicId").optional()),
    body("message").exists(),
    body("type").exists(),
    run(userIdIn("oid")),
    run(setCreationDate),
    run(m => messages.insertOne(m)),
    run(() => null)
)

router.put('/api/message',
    mongoId(body("_id")),
    body("message").exists(),
    run(userIdIn("oid")),
    run(setModifDate),
    run(({_id, oid, message, modifDate}) => messages.updateOne({_id, oid}, {$set: {message, modifDate}})),
    run(() => null)
)

router.get('/api/message',
    mongoId(query("_id").optional()),
    mongoId(query("tid").optional()),
    mongoId(query("oid").optional()),
    query("type").optional().isString().isLength({min: 1, max: 8}),
    gt(mongoId(query("aid").optional())),
    removeUndefineds,
    run(q => messages.find(q)
        .sort({_id: -1})
        .limit(10)
        .toArray()
    )
)

router.delete('/api/message/:_id',
    mongoId(param("_id")),
    run(userIdIn("oid")),
    run(m => messages.deleteOne(m)),
    run(() => null)
)