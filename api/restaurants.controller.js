import ProductsDAO from "../dao/restaurantsDAO.js";

export default class ProductsController {
    static async apiGetProducts(req, res, next) {
        
        const productsPerPage = req.query.productsPerPage ? parseInt(req.query.productsPerPage, 10) : 100

        const page = req.query.page ? parseInt(req.query.page, 10) : 0

        let filters = {}
        if (req.query.dest) {
            filters.dest = req.query.dest
        } else if (req.query.name) {
            filters.name = req.query.name
        } else if (req.query.brand) {
            filters.brand = req.query.brand
        }

        const { productsList, totalNumProducts } = await ProductsDAO.getProducts({ filters, page, productsPerPage })

        let response = {
            products: productsList,
            page: page,
            filters: filters,
            entries_per_page: productsPerPage,
            total_results: totalNumProducts,
        }
        res.json(response)
    }
}