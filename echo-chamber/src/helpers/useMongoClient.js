'use strict'
import { MongoClient, ServerApiVersion } from 'mongodb';

const mongoUri = process.env.DB_URI;
const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  }
};

let useMongoClient = () => { console.log("MongoClient not initialized") };

try {
  const echoMongoClient = new MongoClient(mongoUri, mongoOptions);

  // Test DB reachability
  echoMongoClient.db(process.env.DB_NAME)
    .command({ ping: 1 })
    .then((dbRes) => console.log(dbRes.ok ? "DB reachable!" : dbRes))
    // then create TTL index
    .then(() => {
      echoMongoClient.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_NAME).createIndex({ "timestamp": 1 }, { expireAfterSeconds: 3600 }).then(console.log);
    })
    .catch(console.error);

  // Set which function to export depending on success of the ping
  useMongoClient = (dbName = null, collectionName = null) => {
    const selectedDb = dbName ? echoMongoClient?.db(dbName) : echoMongoClient;
    const selectedCollection = collectionName ? selectedDb?.collection(collectionName) : selectedDb;
    return selectedCollection || {};
  };
} catch (mongoClientCreationError) {
  console.error(mongoClientCreationError);
}

export default useMongoClient;