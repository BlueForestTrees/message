import {col} from "mongo-registry"
import {Router, run} from "express-blueforest"
import {mongoId, removeUndefineds, gt, setCreationDate, setModifDate, userIdIn, anyOf, userShortnameIn, number, mountAidGt} from "../validations"
import {cols} from "../collections"
import {body, param, query} from 'express-validator/check'

const router = Router()
module.exports = router

const messages = col(cols.MESSAGES)

router.post('/api/message',
    mongoId(body("_id")),
    mongoId(body("topicId").optional()),
    mongoId(body("subTopicId").optional()),
    body("type").exists(),
    body("message").exists(),
    run(userIdIn("oid")),
    run(userShortnameIn("shortname")),
    run(setCreationDate),
    run(m => messages.insertOne(m)),
    run(() => null)
)

router.post('/api/message/reply',
    mongoId(body("_id")),
    mongoId(body("msgId")),
    body("message").exists(),
    run(userIdIn("oid")),
    run(userShortnameIn("shortname")),
    run(setCreationDate),
    run(reply => messages.updateOne({_id: reply.msgId}, {$push: {replies: reply}})),
    run(() => null)
)

router.put('/api/message/reply',
    mongoId(body("_id")),
    mongoId(body("msgId")),
    body("message").exists(),
    run(userIdIn("oid")),
    run(setModifDate),
    run(({_id, msgId, oid, message, modifDate}) => messages.updateOne(
        {_id: msgId, "replies._id": _id, "replies.oid": oid},
        {$set: {"replies.$.message": message, "replies.$.modifDate": modifDate}}
    )),
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

router.get('/api/message/count',
    mongoId(query("_id").optional()),
    mongoId(query("topicId").optional()),
    mongoId(query("subTopicId").optional()),
    mongoId(query("oid").optional()),
    query("type").optional().isString().isLength({min: 1, max: 30}),
    gt(mongoId(query("aid").optional())),
    run(removeUndefineds, "REMOVE_UNDEFINEDS"),
    run(q => messages.countDocuments(q, {projection: {replies: {$slice: [0, 3]}}})),
    run(res => res || 0)
)


router.get('/api/message',
    mongoId(query("_id").optional()),
    mongoId(query("topicId").optional()),
    mongoId(query("subTopicId").optional()),
    mongoId(query("oid").optional()),
    mongoId(query("aid").optional()),
    query("type").optional().isString().isLength({min: 1, max: 30}),
    run(mountAidGt, "AID_MOUNTED"),
    run(removeUndefineds, "REMOVE_UNDEFINEDS"),
    run(q => messages.find(q, {projection: {replies: {$slice: [0, 3]}}})
        .sort({_id: 1})
        .limit(10)
        .toArray()
    )
)

router.get('/api/message/reply/:_id/:skip/:limit',
    mongoId(param("_id")),
    number(param("skip")),
    number(param("limit")),
    run(({_id, skip, limit}) => messages.findOne({_id},
        {
            projection: {
                replies: {$slice: [skip, limit]},
                _id: 0, oid: 0, message: 0, creationDate: 0, modifDate: 0, shortname: 0, topicId: 0, type: 0
            }
        }
    ))
)

router.delete('/api/message/:_id',
    mongoId(param("_id")),
    run(userIdIn("oid")),
    run(m => messages.deleteOne(m)),
    run(() => null)
)

router.delete('/api/message/reply/:msgId/:_id',
    mongoId(param("msgId")),
    mongoId(param("_id")),
    run(userIdIn("oid")),
    run(({_id, msgId, oid}) => messages.updateOne({_id: msgId}, {$pull: {replies: {_id, oid}}})),
    run(() => null)
)