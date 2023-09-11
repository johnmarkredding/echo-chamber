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

export default () => {
  return echoMongoClient;
};