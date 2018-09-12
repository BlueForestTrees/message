import api from "../src"
import ENV from "../src/env"
import {init, withTest} from "test-api-express-mongo"
import {cols} from "../src/collections"
import {createObjectId, object} from "test-api-express-mongo"
import {authGod, god} from "./database/users"

describe('Messages', function () {

    beforeEach(init(api, ENV, cols))

    const _id = createObjectId()
    const topicId = createObjectId()
    const creationDate = new Date()

    it('post message', withTest(
        {
            req: {
                url: "/api/message",
                method: "POST",
                body: {
                    _id, topicId,
                    message: "salut bonhomme!!",
                    type: "PLAN"
                },
                headers: authGod
            },
            db: {
                expected: {
                    colname: cols.MESSAGES,
                    doc: {
                        topicId,
                        message: "salut bonhomme!!",
                        type: "PLAN",
                        oid: god._id
                    }
                }
            }
        }
    ))

    it('edit message', withTest({
        db: {
            preChange: {
                colname: cols.MESSAGES,
                doc: {
                    _id, creationDate, topicId,
                    message: "salut bonhomme!!",
                    type: "PLAN",
                    oid: god._id
                }
            },
            doc: {
                topicId,
                message: "salut MONSIEUR bonhomme!!",
                type: "PLAN",
                oid: god._id
            }
        },
        req: {
            url: "/api/message",
            method: "PUT",
            body: {
                _id,
                message: "salut MONSIEUR bonhomme!!"
            },
            headers: authGod
        },
    }))

    it('delete message', withTest({
        db: {
            preChange: {
                colname: cols.MESSAGES,
                doc: {
                    _id, creationDate, topicId,
                    message: "salut bonhomme!!",
                    type: "PLAN",
                    oid: god._id
                }
            },
            missingDoc: {
                _id
            }
        },
        req: {
            url: `/api/message/${_id}`,
            method: "DELETE",
            headers: authGod
        },
    }))

    it('get message', withTest({
        db: {
            preChange: {
                colname: cols.MESSAGES,
                doc: {
                    _id, creationDate, topicId,
                    message: "salut bonhomme!!",
                    type: "PLAN",
                    oid: god._id
                }
            }
        },
        req: {
            url: `/api/message?_id=${_id}`,
            method: "GET",
        },
        res: {
            bodypath: [
                {path: "$[0]._id", value: _id.toString()},
                {path: "$[0].creationDate", value: creationDate.toISOString()},
                {path: "$[0].topicId", value: topicId},
                {path: "$[0].message", value: 'salut bonhomme!!'},
                {path: "$[0].type", value: 'PLAN'},
                {path: "$[0].oid", value: god._id},
            ]
        }
    }))

})