'use strict';
import { Observable } from 'rxjs';
import { MongoClient } from 'mongodb';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

export default ({uri, dbName, collectionName, pipelineFilter, ...mongoOptions}) => {
  return new Observable((subscriber) => {
    const client = new MongoClient(uri, mongoOptions);
    const echoChanges = client
      .db(dbName)
      .collection(collectionName)
      .watch(pipelineFilter);

    echoChanges.on("change", (e) => subscriber.next(e));
    echoChanges.on("error", (err) => subscriber.error(err));
    echoChanges.on("close", (e) => subscriber.complete(e));
    return () => {
      echoChanges.close();
    }
  });
};
