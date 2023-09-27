import { toClientFormattedEcho } from "../helpers/index.js";
import { metersToRadians } from "../utilities/index.js";
const { QUERY_RADIUS_M, DB_ECHO_TTL } = process.env;

export default (collection, {latitude, longitude}) => {
  return collection.find({
    $and: [
      // Find only entries within the last ___TTL___ time period.
      { "timestamp": {$gt: new Date(Date.now() - (DB_ECHO_TTL * 1000))} },
      { "location": {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], metersToRadians(QUERY_RADIUS_M)]
          }
        }
      }
    ]
  }).toArray()
    .then((locatedEchoes) => locatedEchoes.map(toClientFormattedEcho))
    .catch((err) => { console.error("Get Echoes Error", err) });
};