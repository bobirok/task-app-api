const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const email = require('../emails/account')

router.post('/users',async (request, response) => {
    const user = new User(request.body)

    try{ 
        await user.save()
        const token = await user.generateAuthToken()
        email.sendWelcomeEmail(user.email, user.name)
        response.send({ user, token })
    } catch(e) {
        response.status(400).send(e)
    }
})

router.post('/users/login', async (request, response) => {
    try {
        const user = await User.findByCredentials(request.body.email, request.body.password)
        const token = await user.generateAuthToken()
        response.status(200).send({ user, token})
    } catch(e) {
        response.status(400).send()
    }
})

router.post('/users/logout', auth , async (request, response) => {
    try {
        request.user.tokens = request.user.tokens.filter((token) => {
            return token.token !== request.token
        })
        await request.user.save()

        response.status(200).send()
    } catch(e) {
        response.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (request, response) => {
    try {
        request.user.tokens = []
        await request.user.save()
        response.status(200).send()
    } catch(e) {
        response.status(500).send()
    }
})

router.get('/users/me', auth ,async (request, response) => {
    response.send(request.user)
})

router.patch('/users/me', auth, async (request, response) => {
    const updates = Object.keys(request.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidOperation) {
        return response.status(400).send({ error: 'Invalid updates'})
    }

    try {
        updates.forEach((update) => {
            request.user[update] = request.body[update]
        })

        await request.user.save()

        response.send(request.user)
    } catch(e) {
        response.status(400).send(e)
    }
})

router.delete('/users/me', auth ,async (request, response) => {
    try {
        await request.user.remove()
        email.sendCancelationEmail(request.user.email, request.user.name)
        response.status(200).send(request.user)
    } catch(e) {
        response.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    }, 
    fileFilter(request, file, cb) {
        if(!file.originalname.match('\.(jpg|jpeg|png)$')) {
            return cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (request, response) => {
    const buffer = await sharp(request.file.buffer).resize(250, 250).png().toBuffer()
    request.user.avatar = buffer
    await request.user.save()
    response.send()
}, (error, request, response, next) => {
    response.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (request, response) => {
    request.user.avatar = undefined
    await request.user.save()
    response.send()
}, (error, request, response, next) => {
    response.status(404).send({ error: error.message})
})

router.get('/users/:id/avatar', async (request, response) => {
    try {
        const user = await User.findById(request.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        response.set('Content-Type', 'image/png')
        response.send(user.avatar)
    } catch(e) {
        response.status(404).send()
    }
})

module.exports = router