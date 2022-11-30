const express = require('express');
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();
const { graphqlHTTP} = require('express-graphql');
const schema = require('./schema/schema')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000;

const app = express();

//connect to mongodb cloud
connectDB()

//Fix CORS issue
app.use(cors());

//create graph layer where APIs exist
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

//server that hosts backend APIs using graphql
app.listen(port, console.log(`express is running on ${port}`))