const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth ,async (request, response) => {
    const task = new Task({
        ...request.body,
        owner: request.user._id
    })

    try{
        await task.save()
        response.status(201).send(task)
    } catch(e) {
        response.status(400).send(e)
    }
})

//GET tasks optionally completed=true
router.get('/tasks', auth ,async (request, response) => {
    const match = {}
    const sort = {}

    if(request.query.completed) {
        match.completed = request.query.completed === 'true'
    }

    if(request.query.sortBy) {
        const parts = request.query.sortBy.split(':')
        // If it is = desc we set it to -1 otherwise we set it to 1
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await request.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(request.query.limit),
                skip: parseInt(request.query.skip),
                sort
            }
        }).execPopulate()
        response.status(200).send(request.user.tasks)
    } catch(e) {
        response.status(500).send(e)
    }
})

router.get('/tasks/:id', auth ,async (request, response) => {
    const _id = request.params.id
    try {
        const task = await Task.findOne({ _id, owner: request.user._id })

        if(!task) {
            return response.status(404).send()
        }

        response.status(200).send(task)
    } catch(e) {
        response.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth ,async (request, response) => {
    const updates = Object.keys(request.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return response.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = request.params.id
    try {
        const task = await Task.findOne({ _id, owner: request.user._id})

        if(!task) {
            return response.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = request.body.update
        })

        await task.save()
        
        response.status(200).send(task)
    } catch(e) {
        response.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth ,async (request, response) => {
    const _id = request.params.id

    try {
        const task = await Task.findOneAndDelete({_id, owner: request.user._id})

        if(!task) {
            return response.status(404).send({error: 'Could not be found!'})
        }

        response.status(200).send(task)
    } catch(e) {
        response.status(500).send(e)
    }
})

module.exports = router