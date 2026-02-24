const express = require('express')
const {addToCart, getCartItems, removeCartItem} = require("../controller/CartController");
const router = express.Router()

router.post('/', addToCart)

router.get('/', getCartItems)

router.delete('/:id', removeCartItem)

// router.get('/', removeCartItem)


module.exports = router