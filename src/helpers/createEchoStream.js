'use strict';
import {Observable} from 'rxjs';
import {metersToRadians} from '../utilities/index.js';
import {
  getEchoes,
  useMongoClient,
  createMongoStream
} from '../helpers/index.js';
const {
  QUERY_RADIUS_M,
  DB_NAME,
  DB_COLLECTION_NAME
} = process.env;

export default ({latitude,longitude}) => {
  // Setup mongo observable
  const pipelineFilter = [{
    $match: {
      $or: [
        {'operationType': 'delete'},
        {
          $and: [
            {'operationType': 'insert'},
            {
              'fullDocument.location': {
                $geoWithin: {
                  $centerSphere: [[longitude, latitude], metersToRadians(QUERY_RADIUS_M)]
                }
              }
            }
          ]
        }
      ]
    }
  }];

  const collection = useMongoClient(DB_NAME, DB_COLLECTION_NAME);
  const mongoStream = createMongoStream({collection, pipelineFilter});
  // Grab updated echoes when mongo stream alerts
  const echoStream = new Observable((subscriber) => {
    const mongoSubscription = mongoStream.subscribe({
      next: () => {
        getEchoes(collection, {latitude, longitude})
          .then((fetchedEchoes) => {
            subscriber.next(fetchedEchoes);
            return fetchedEchoes;
          })
          .catch((err) => console.error(err));
      },
      error: (mongoSubError) => {subscriber.error(mongoSubError)},
      complete: (e) => {subscriber.complete(e)}
    });
    return () => {
      mongoSubscription.unsubscribe();
    };
  });

  // Return echo observable
  return echoStream;
};