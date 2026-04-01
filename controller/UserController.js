const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const join = (req, res) => {
    const {email, password} = req.body

    let sql = 'INSERT INTO users(email, password, salt) VALUES (?,?,?)'

    const salt = crypto.randomBytes(10).toString('base64')
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')

    let values = [email, hashPassword, salt]
    conn.query(sql, values, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        if (result.affectedRows) {
            res.status(StatusCodes.CREATED).json(result)
        }
        else {
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
    })
}

const login = (req, res) => {
    const {email, password} = req.body
    let sql = 'SELECT * FROM users WHERE email = ?'

    conn.query(sql, [email], (err, results) => {

        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        const loginUser = results[0]

        const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64')

        console.log(loginUser.password)
        console.log(hashPassword)

        if (loginUser && loginUser.password == hashPassword) {
            const token = jwt.sign({
                id: loginUser.id,
                email: loginUser.email
            }, process.env.PRIVATE_KEY, {
                expiresIn: '10m',
                issuer: "hyunji"
            })

            res.cookie("token", token, {
                httpOnly: true
            })

            console.log("쿠키요", token)

            return res.status(StatusCodes.OK).json(results)
        }
        else {
            console.log("dd")
            return res.status(StatusCodes.UNAUTHORIZED).end()
        }
    })
}


const requestPasswordReset = (req, res) => {
    const {email, password} = req.body

    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, email, (err, results) => {
        if(err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }

        const user = results[0]

        if (user) {
            return res.status(StatusCodes.OK).json({
                email: email
            })
        }
        else {
            return res.status(StatusCodes.UNAUTHORIZED).end()
        }
    })
}

const passwordReset = (req, res) => {
    const {password, email} = req.body

    let sql = 'UPDATE users SET password=?, salt=? WHERE email=?'

    const salt = crypto.randomBytes(10).toString('base64')
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64')

    let values = [hashPassword, salt, email]
    conn.query(sql, values, (err, results) => {

        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
        console.log(results)

        if (results.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).end
        }
        else {
            return res.status(StatusCodes.OK).json(results)
        }
    })
}

module.exports = {
    join,
    login,
    requestPasswordReset,
    passwordReset
}