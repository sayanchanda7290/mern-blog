const { Router } = require('express')
const User = require('../models/User')
const Post = require('../models/Post')

const jwt = require('jsonwebtoken')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')

const router = Router()

router.post('/post', uploadMiddleware.single('file'), async (req, res) => {
	const { originalname, path } = req.file
	const parts = originalname.split('.')
	const ext = parts[parts.length - 1]
	const newPath = path + '.' + ext
	fs.renameSync(path, newPath)

	const { token } = req.cookies
	jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
		if (err) throw err
		const { title, summary, content } = req.body
		const postDoc = await Post.create({
			title,
			summary,
			content,
			cover: newPath,
			author: info.id,
		})
		res.json(postDoc)
	})
})

router.put('/post', uploadMiddleware.single('file'), async (req, res) => {
	let newPath = null
	if (req.file) {
		const { originalname, path } = req.file
		const parts = originalname.split('.')
		const ext = parts[parts.length - 1]
		newPath = path + '.' + ext
		fs.renameSync(path, newPath)
	}
	const { token } = req.cookies
	jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
		if (err) throw err
		const { id, title, summary, content } = req.body
		const postDoc = await Post.findById(id)
		const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)
		if (!isAuthor) {
			return res.status(400).json('you are not the author')
		}
		await postDoc.update({
			title,
			summary,
			content,
			cover: newPath ? newPath : postDoc.cover,
		})

		res.json(postDoc)
	})
})

router.get('/post', async (req, res) => {
	res.json(
		await Post.find()
			.populate('author', ['username'])
			.sort({ createdAt: -1 })
			.limit(20)
	)
})

router.get('/post/:id', async (req, res) => {
	const { id } = req.params
	const postDoc = await Post.findById(id).populate('author', ['username'])
	res.json(postDoc)
})

module.exports = router
