const mongodb = require("mongodb");
const dotenv = require("dotenv");

const express = require("express");
const cors = require("cors");

dotenv.config();

const MongoClient = mongodb.MongoClient;


let products;
const injectDB = async (conn) => {
    if (products) {
        return;
    }
    try {
        products = await conn.db('shopee_db').collection("product_data");
    } catch (error) {
        console.error(
            `Unable to estalish a collection handle in restaurantsDAO: ${error}`
        );
    }
}

const getProducts =  async ({ filters = null, page = 0, limit = 100 } = {}) => {
    let query;
    if (filters) {
      if ("brand" in filters) {
        query = { $text: { $search: filters["brand"] } };
      } else if ("dest" in filters) {
        query = { $text: { $search: `|${filters["dest"]}|` } };
      } else if ("name" in filters) {
        query = { $text: { $search: filters["name"] } };
      } else if ("source" in filters) {
        query = { $text: { $search: filters["source"] } };
      }
    }

    let cursor;
    try {
      cursor = await products.find(query);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { productsList: [], totalNumProducts: 0 };
    }

    const displayCursor = cursor.limit(limit).skip(limit * page);

    try {
      const productsList = await displayCursor.toArray();
      const totalNumProducts = await products.countDocuments(query);

      return { productsList, totalNumProducts };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { productsList: [], totalNumProducts: 0 };
    }
}



const port = 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/products", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
  const page = req.query.page ? parseInt(req.query.page, 10) : 0;

  let filters = {};
  if (req.query.dest) {
    filters.dest = req.query.dest;
  } else if (req.query.name) {
    filters.name = req.query.name;
  } else if (req.query.brand) {
    filters.brand = req.query.brand;
  } else if (req.query.source) {
    filters.source = req.query.source;
  }
  
  const { productsList, totalNumProducts } = await getProducts({
    filters,
    page,
    limit,
  });
  let response = {
    products: productsList,
    page: page,
    filters: filters,
    entries_per_page: limit,
    total_results: totalNumProducts,
  };
  res.json(response);
});

app.use("*", (req, res) => res.status(404).json({ error: "Not Found" }));

MongoClient.connect('mongodb+srv://duong:duongmongodb@cluster0.dn9bkly.mongodb.net/shopee_db?retryWrites=true&w=majority', {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  useNewUrlParser: true,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await injectDB(client);

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

module.exports = app;