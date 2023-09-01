const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')

const connectDB = require('./dbConn')

dotenv.config()

connectDB()

const app = express()

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use('/', userRoutes)
app.use('/', postRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started at PORT ${PORT}`))
