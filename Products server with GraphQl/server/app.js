require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

let fetch;
import("node-fetch").then(({ default: nodeFetch }) => {
  fetch = nodeFetch;
});

const app = express();
const port = 3000;

app.use(cors());

const {
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_USER_NAME,
  DATABASE_PORT,
} = process.env;

const pool = new Pool({
  user: DATABASE_USER_NAME,
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  password: DATABASE_PASSWORD,
  port: DATABASE_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to database');
    release();
  });

const createTableText = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  bodyHtml TEXT,
  imageSrc TEXT
);`;

pool
  .query(createTableText)
  .then((res) => console.log("Table ready"))
  .catch((e) => console.error(e.stack));

app.get("/", async (req, res) => {
  try {
    const graphqlEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2023-01/graphql.json`;

    const query = `
    {
        products(first: 10) {
          edges {
            node {
              id
              bodyHtml
              images(first: 1) {
                edges {
                  node {
                    src
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    for (const product of data.data.products.edges) {
        const text = `
        INSERT INTO products(external_id, bodyHtml, imageSrc) 
        VALUES($1, $2, $3) 
        ON CONFLICT (external_id) DO UPDATE 
        SET bodyHtml = excluded.bodyHtml, 
            imageSrc = excluded.imageSrc;
        `;
        const values = [product.node.id, product.node.bodyHtml, product.node.images.edges[0].node.src];
        await pool.query(text, values);
    }

    const dbResponse = await pool.query("SELECT * FROM products");
    res.json(dbResponse.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
