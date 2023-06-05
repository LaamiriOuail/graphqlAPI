const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs=require("./graphQL/schema/typedefs");
const resolvers=require("./graphQL/resolvers/resolvers");
require('dotenv').config();
const PORT = process.env.PORT ||8080;
const DATABASE_URI = process.env.DATABASE_URI 
// Connect to MongoDB
mongoose.connect(DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});


app=express()
// Create an instance of ApolloServer
const server = new ApolloServer({ typeDefs, resolvers,playground: true });

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});