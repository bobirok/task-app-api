const express = require('express')
const mongoose = require('mongoose')
require('./db/mongoose')
const User = require('./models/user.js')
const Task = require('./models/task.js')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port: ' + port)
})
