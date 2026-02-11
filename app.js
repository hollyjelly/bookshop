const dotenv = require('dotenv')
const express = require('express')
const app = express()

dotenv.config()

app.listen(process.env.PORT)

const userRouter = require('./routes/users')
const bookRouter = require('./routes/book')
const cartsRouter = require('./routes/carts')
const likesRouter = require('./routes/likes')
const orderRouter = require('./routes/order')

app.use('/users', userRouter)
app.use('/books', bookRouter)
app.use('/carts', cartsRouter)
app.use('/likes', likesRouter)
app.use('/orders', orderRouter)