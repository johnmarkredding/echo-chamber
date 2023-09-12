'use strict';
import { Observable, startWith } from 'rxjs';
import {
  getEchoes,
  useMongoClient,
  createMongoStream
} from "../helpers/index.js";
const {
  QUERY_RADIUS,
  DB_NAME,
  DB_COLLECTION_NAME
} = process.env;

export default ({latitude,longitude}) => {
  // Setup mongo observable
  const pipelineFilter = [{
    $match: {
      $and: [
        { operationType: 'insert' },
        {
          'fullDocument.location': {
            $geoWithin: { $centerSphere: [[longitude, latitude], Number(QUERY_RADIUS)] },
          },
        },
      ],
    },
  }];

  const collection = useMongoClient(DB_NAME, DB_COLLECTION_NAME);
  const mongoStream = createMongoStream({collection, pipelineFilter})
    .pipe(
      startWith([])
    );
  // Grab updated echoes when mongo stream alerts
  const echoStream = new Observable((subscriber) => {
    const mongoSubscription = mongoStream.subscribe({
      next: (e) => { subscriber.next(getEchoes({latitude,longitude}))},
      error: (mongoSubError) => { console.error(mongoSubError) },
      complete: (e) => { subscriber.complete(e) }
    })
    return () => {
      mongoSubscription.unsubscribe();
    }
  })

  // Return echo observable
  return echoStream;
};
