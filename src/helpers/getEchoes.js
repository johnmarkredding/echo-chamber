import {toClientFormattedEcho} from '../helpers/index.js';
import {metersToRadians} from '../utilities/index.js';
const {DB_ECHO_TTL} = process.env;

export default (collection, {latitude, longitude, radius}) => {
  return collection.find({
    $and: [
      // Find only entries within the last ___TTL___ time period.
      {'timestamp': {$gt: new Date(Date.now() - (DB_ECHO_TTL * 1000))}},
      {'location': {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], metersToRadians(radius)]
        }
      }
      }
    ]
  }).toArray()
    .then((locatedEchoes) => locatedEchoes.map(toClientFormattedEcho))
    .catch((err) => {console.error('Get Echoes Error', err)});
};