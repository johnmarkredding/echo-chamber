'use strict'
import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoUri = process.env.DB_URI;
const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  }
};
const echoMongoClient = new MongoClient(mongoUri, mongoOptions);

// Test
echoMongoClient.db(process.env.DB_NAME).command({ ping: 4 }).then(console.log).catch(console.error);

export default (dbName = null, collectionName = null) => {
  const selectedDb = dbName ? echoMongoClient.db(dbName) : echoMongoClient;
  const selectedCollection = collectionName ? selectedDb.collection(collectionName) : selectedDb;
  return selectedCollection;
};