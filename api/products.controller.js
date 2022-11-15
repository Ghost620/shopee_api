import ProductsDAO from "../dao/productsDAO.js";

export default class ProductsController {
    static async apiGetProducts(req, res, next) {
        
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100

        const page = req.query.page ? parseInt(req.query.page, 10) : 0

        let filters = {}
        if (req.query.dest) {
            filters.dest = req.query.dest
        } else if (req.query.name) {
            filters.name = req.query.name
        } else if (req.query.brand) {
            filters.brand = req.query.brand
        }

        const { productsList, totalNumProducts } = await ProductsDAO.getProducts({ filters, page, limit })

        let response = {
            products: productsList,
            page: page,
            filters: filters,
            entries_per_page: limit,
            total_results: totalNumProducts,
        }
        res.json(response)
    }
}