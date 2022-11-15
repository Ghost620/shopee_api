let products;

export default class ProductsDAO {
    static async injectDB(conn) {
        if (products){
            return
        }
        try {
            products = await conn.db(process.env.RESTREVIEWS_NS).collection("product_data")
        } catch (error) {
            console.error(`Unable to estalish a collection handle in restaurantsDAO: ${error}`)
        }
    }

    static async getProducts({
        filters = null,
        page = 0,
        limit = 100
    } = {}) {

        let query
        if (filters) {
            if ("brand" in filters) {
                query = { $text: { $search: filters["brand"] } }
            } else if ("dest" in filters) {
                query = { $text: { $search: `|${filters["dest"]}|` } }
            } else if ("name" in filters) {
                query = { $text: { $search: filters["name"] } }
            }
        }

        let cursor;
        try {
            cursor = await products.find(query)
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { productsList: [], totalNumProducts: 0 }
        }

        const displayCursor = cursor.limit(limit).skip(limit * page)

        try {
            const productsList = await displayCursor.toArray()
            const totalNumProducts = await products.countDocuments(query)
      
            return { productsList, totalNumProducts }
        } catch (e) {
        console.error(
            `Unable to convert cursor to array or problem counting documents, ${e}`,
        )
        return { productsList: [], totalNumProducts: 0 }
        }
    }
}