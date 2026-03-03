// const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes')
const mariadb = require('mysql2/promise')

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,
    })

    const {items, delivery, totalQuantity, totalPrice, userId, firstBookTitle} = req.body

    // 1. delivery 삽입
    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`
    let values = [delivery.address, delivery.receiver, delivery.contact]
    let [results] = await conn.execute(sql, values)
    let delivery_id = results.insertId

    // 2. orders 삽입
    sql = "INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) VALUES (?, ?, ?, ?, ?)"
    values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id]
    ;[results] = await conn.execute(sql, values)
    let order_id = results.insertId

    // 3. items를 가지고 장바구니에서 book_id와 quantity 조회
    sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`
    let [orderItems, fields] = await conn.query(sql, [items])

    // 3. orderBook 삽입 (여러 행) - query 사용
    sql = `INSERT INTO orderBook (order_id, book_id, quantity) VALUES (?, ?, ?)`
    values = []
    for (const item of orderItems) {
        await conn.execute(sql, [order_id, item.book_id, item.quantity])
    }

    // 4. cartItems 삭제
   let result = deleteCartItems(conn, items)

    return res.status(StatusCodes.OK).json(result)
}

const deleteCartItems = async (conn, items) => {
    console.log(items)
    let sql = `DELETE FROM cartItems WHERE id IN (?)`

    let result = await conn.query(sql, [items])
    return result
}

const getOrders = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,
    })

    let sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price FROM orders LEFT JOIN delivery ON orders.delivery_id = delivery.id`
    let [rows, fields] = await conn.query(sql)

    return res.status(StatusCodes.OK).json(rows)
}

const getOrderDetail = async (req, res) => {
    const {id} = req.params

    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,
    })

    let sql = `SELECT book_id, title, author, price, quantity  FROM orderBook LEFT JOIN books ON orderBook.book_id = books.id WHERE order_id=?`
    let [rows, fields] = await conn.query(sql, [id])
    return res.status(StatusCodes.OK).json(rows)
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
}