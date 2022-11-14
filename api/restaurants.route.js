import express from "express"
import ProductsController from "./restaurants.controller.js"

const router = express.Router()

router.route("/").get(ProductsController.apiGetProducts)

export default router