const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (request, response, next) => {
    try {
        const token = request.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded.id , 'tokens.token': token})

        if(!user) {
            throw new Error()
        }

        request.token = token
        request.user = user
        console.log(request.user)
        next()

    } catch(e) {
        response.status(401).send({ error: 'Please authenticate'})
    }
}

module.exports = auth