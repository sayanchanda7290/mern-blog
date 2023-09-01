const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Post = require('../models/Post')

const salt = bcrypt.genSaltSync(10)
const JWT_SECRET = 'asdfe45we45w345wegw345werjktjwertkj'

const router = Router()

router.post('/register', async (req, res) => {
	const { username, password } = req.body
	try {
		const userDoc = await User.create({
			username,
			password: bcrypt.hashSync(password, salt),
		})
		res.json(userDoc)
	} catch (e) {
		console.log(e)
		res.status(400).json(e)
	}
})

router.post('/login', async (req, res) => {
	const { username, password } = req.body
	const userDoc = await User.findOne({ username })
	if(!userDoc) {
		return res.status(404).json('User not found')
	}
	const passOk = bcrypt.compareSync(password, userDoc.password)
	if (passOk) {
		// logged in
		jwt.sign({ username, id: userDoc._id }, process.env.JWT_SECRET, {}, (err, token) => {
			if (err) throw err
			res.cookie('token', token).json({
				id: userDoc._id,
				username,
			})
		})
	} else {
		res.status(400).json('wrong credentials')
	}
})

router.get('/profile', (req, res) => {
	const { token } = req.cookies
	jwt.verify(token || '', process.env.JWT_SECRET, {}, (err, info) => {
		if (err) return res.json('Custom error')
		res.json(info)
	})
})

router.post('/logout', (req, res) => {
	res.cookie('token', '').json('ok')
})

module.exports = router
