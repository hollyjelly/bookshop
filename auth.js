const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config()

const ensureAuthorization = (req, res) => {
    try {
        let received = req.headers["authorization"]

        if (received) {
            let decodedJwt = jwt.verify(received, process.env.PRIVATE_KEY)
            return decodedJwt
        }
        else {
            throw new ReferenceError('jwt must be provided')
        }
    }
    catch (err) {
        console.log(err.name)
        console.log(err.message)
        return err
    }
}

module.exports = ensureAuthorization
