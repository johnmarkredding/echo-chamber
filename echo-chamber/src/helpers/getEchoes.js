import { toClientFormattedEcho } from "../helpers/index.js";
import { metersToRadians } from "../utilities/index.js";
const { QUERY_RADIUS_M } = process.env;

export default (collection, {latitude, longitude}) => {
  return collection.find(
    {
    "location": {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], metersToRadians(QUERY_RADIUS_M)]
      }
    }
  }
  ).toArray()
    .then((locatedEchoes) => locatedEchoes.map(toClientFormattedEcho))
    .catch((err) => { console.error("Get Echoes Error", err) });
};