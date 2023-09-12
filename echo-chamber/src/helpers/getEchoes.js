import { toClientFormattedEcho } from "../helpers/index.js";

export default (collection, {latitude, longitude}) => {
  return collection.find(
  //   {
  //   "location": {
  //     $nearSphere: {
  //       $geometry: {
  //         type: "Point",
  //         coordinates: [longitude, latitude]
  //       },
  //       $maxDistance: Number(process.env.QUERY_RADIUS)
  //     }
  //   }
  // }
  ).toArray()
    .then((locatedEchoes) => locatedEchoes.map(toClientFormattedEcho))
    .catch((err) => { console.error("Get Echoes Error", err) });
};