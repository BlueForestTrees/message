import api from "../src"
import ENV from "../src/env"
import {init, withTest} from "test-api-express-mongo"
import {cols} from "../src/collections"
import {createObjectId, object} from "test-api-express-mongo"
import {authGod, authSimple, god, simple} from "./database/users"

describe('Messages', function () {

    beforeEach(init(api, ENV, cols))

    const _id = object("fafa0001aaaaaaaaaaaaaaa1")
    const _id2 = object("fafa0001aaaaaaaaaaaaaaa2")
    const _id3 = object("fafa0001aaaaaaaaaaaaaaa3")
    const _id4 = object("fafa0001aaaaaaaaaaaaaaa4")
    const _id5 = object("fafa0001aaaaaaaaaaaaaaa5")
    const topicId = createObjectId()
    const creationDate = new Date()

    const conversation = [
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
            }
        },
        {
            req: {
                url: "/api/message/reply",
                method: "POST",
                body: {
                    _id: _id2,
                    msgId: _id,
                    message: "salut mec, ça va ti??",
                },
                headers: authSimple
            }
        },
        {
            req: {
                url: "/api/message/reply",
                method: "POST",
                body: {
                    _id: _id3,
                    msgId: _id,
                    message: "moi oui 2",
                },
                headers: authSimple
            }
        },
        {
            req: {
                url: "/api/message/reply",
                method: "POST",
                body: {
                    _id: _id4,
                    msgId: _id,
                    message: "super je suis content!!",
                },
                headers: authGod
            }
        },
        {
            req: {
                url: "/api/message/reply",
                method: "POST",
                body: {
                    _id: _id5,
                    msgId: _id,
                    message: "Mais je veux dire, grace content",
                },
                headers: authGod
            }
        },
    ]

    const conv2 = [{
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
    },
        {
            req: {
                url: "/api/message",
                method: "POST",
                body: {
                    _id: _id2, topicId,
                    message: "salut bonhomme!!",
                    type: "PLAN"
                },
                headers: authGod
            },
        },
        {
            req: {
                url: "/api/message",
                method: "POST",
                body: {
                    _id: _id3, topicId,
                    message: "salut bonhomme!!",
                    type: "PLANB"
                },
                headers: authGod
            },
        }]

    it('delete reply', withTest([
        ...conversation,
        {
            req: {
                url: `/api/message/reply/${_id}/${_id2}`,
                method: "DELETE",
                headers: authSimple
            }
        }
    ]))

    it('conversation', withTest([
        ...conversation,
        {
            req: {
                url: `/api/message?_id=${_id}`,
                method: "GET",
            },
            res: {
                bodypath: [
                    {path: "$.length", value: 1},
                    {path: "$[0].replies.length", value: 3},
                    {path: "$[0].oid", value: god._id.toString()},
                    {path: "$[0].replies[0]._id", value: _id2.toString()},
                    {path: "$[0].replies[0].oid", value: simple._id.toString()},
                ]
            }
        }
    ]))

    it('edit reply', withTest([
        ...conversation,
        {
            req: {
                url: `/api/message/reply`,
                method: "PUT",
                headers: authSimple,
                body: {
                    msgId: _id,
                    _id: _id2,
                    message: "réponse modifiée"
                }
            }
        }
    ]))

    it('edit reply bad authent', withTest([
        ...conversation,
        {
            req: {
                url: `/api/message/reply`,
                method: "PUT",
                headers: authGod,
                body: {
                    msgId: _id,
                    _id: _id2,
                    message: "réponse modifiée"
                }
            }
        }
    ]))

    it('count', withTest([
        ...conv2,
        {
            req: {
                url: `/api/message/count?type=PLAN`,
                method: "GET",
            },
            res: {
                body: 2
            }
        }
    ]))

    it('after id', withTest([
        ...conv2,
        {
            req: {
                url: `/api/message?aid=${_id}`,
                method: "GET",
            },
            res: {
                bodypath: [
                    {path: "$.length", value: 2},
                    {path: "$[0]._id", value: _id2.toString()},
                    {path: "$[1]._id", value: _id3.toString()}
                ]
            }
        }
    ]))

    it('replies', withTest([
        ...conversation,
        {
            req: {
                url: `/api/message/reply/${_id}/1/2`,
                method: "GET",
            },
            res: {
                bodypath: [
                    {path: "$.replies.length", value: 2},
                    {path: "$.replies[0].oid", value: simple._id.toString()},
                    {path: "$.replies[0].message", value: "moi oui 2"},
                    {path: "$.replies[0].shortname", value: "simple Guy"},
                    {path: "$.replies[1].oid", value: god._id.toString()},
                ]
            }
        }
    ]))

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
                        oid: god._id,
                        shortname: god.shortname
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
                    oid: god._id,
                    shortname: god.shortname
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
                {path: "$[0].shortname", value: god.shortname},
            ]
        }
    }))

    it('get message vide', withTest({
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
            url: `/api/message?type=FAUX_TYPE`,
            method: "GET",
        },
        res: {
            bodypath: [
                {path: "$.length", value: 0}
            ]
        }
    }))

})