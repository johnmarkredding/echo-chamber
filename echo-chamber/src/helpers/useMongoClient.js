'use strict'
import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoUri = process.env.DB_URI;
const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  }
};

try {
  const echoMongoClient = new MongoClient(mongoUri, mongoOptions);

  // Test DB reachability
  echoMongoClient.db(process.env.DB_NAME)
    .command({ ping: 1 })
    .then((dbRes) => { console.log(dbRes.ok ? "DB reachable!" : dbRes) })
    .catch(console.error);
} catch (mongoClientCreationError) {
  console.error(mongoClientCreationError);
}


export default (dbName = null, collectionName = null) => {
  const selectedDb = dbName ? echoMongoClient?.db(dbName) : echoMongoClient;
  const selectedCollection = collectionName ? selectedDb?.collection(collectionName) : selectedDb;
  return selectedCollection || {};
};