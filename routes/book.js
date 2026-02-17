const express = require('express')
const {allBooks, bookDetail} = require("../controller/BookController");
const router = express.Router()

router.use(express.json())


router.get('/', allBooks) // 전체조회, 카테고리별 조회
router.get('/:id', bookDetail)


module.exports = router