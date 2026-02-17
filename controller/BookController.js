const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes')
const {parse} = require("dotenv");

// (카테고리 별 / 신간 여부)전체 도서 목록 조회
const allBooks = (req, res) => {
    let {category_id, news, limit, currentPage} = req.query
    limit = parseInt(limit)
    currentPage = parseInt(currentPage)

    let offset = limit * (currentPage-1)

    let sql = 'SELECT * FROM books'
    let val = []
    if(category_id && news) {
        sql += ' WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()'
        val = [category_id]
    }
    else if(category_id) {
        sql += ' WHERE category_id=?'
        val = [category_id]
    }
    else if(news) {
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()'
    }

    sql += ' LIMIT ? OFFSET ?'
    val.push(limit, offset)

    conn.query(sql,val, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        if (results.length) {
            return res.status(StatusCodes.OK).json(results)
        }
        else {
            return res.status(StatusCodes.NOT_FOUND).end()
        }
    })
}

const bookDetail = (req, res) => {
    let {id} = req.params
    id = parseInt(id)
    console.log("확인", id)

    let sql = 'SELECT * FROM books LEFT JOIN category ON books.category_id = category.id WHERE books.id = ?'
    conn.query(sql,id, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        if (results[0]) {
            console.log("확인2", results[0].id)
            return res.status(StatusCodes.OK).json(results[0])
        }
        else {
            return res.status(StatusCodes.NOT_FOUND).end()
        }
    })
}

module.exports = {
    allBooks,
    bookDetail,
}