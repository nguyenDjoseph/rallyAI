import express from 'express';
import express_graphql from 'express-graphql';
import { buildSchema } from 'graphql';
import dotenv from 'dotenv';

// Enviroment variables
if (process.env.ENV === "dev") {
  dotenv.config();
  console.log("\x1b[35m%s\x1b[0m","Dev Mode, Initializing dotenv library");
}

var knex = require('knex')({
  client: 'pg',
  connection: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
  }
});

// GraphQL schema
const schema = buildSchema(`
  type Stock {
    id: Int
    symbol: String
    company_name: String
    market_date: String
    closing_price: Float
    opening_price: Float
    highest_price: Float
    lowest_price: Float
    volume_in_millions: String
  }
  type Query {
    statusCode: Int
    error: Boolean
    results(stockSymbol: String): [Stock]
  }
`);

const getDataFromSymbol = async (symbol) => {
  const data = await knex('stocks').where('symbol', symbol);
  return data;
}

// Root resolver
const root = {
  results: async ({stockSymbol}) => {
    const returnedData = await getDataFromSymbol(stockSymbol);
    return returnedData;
  }
};

// Create an express server and a GraphQL endpoint
const app = express();
app.use(
  "/graphql",
  express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => console.log("\x1b[5m\x1b[35m%s\x1b[0m",`Express GraphQL Server Now Running On localhost:${serverPort}/graphql`));