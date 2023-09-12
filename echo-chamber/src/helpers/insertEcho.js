'use strict'
import { toClientFormattedEcho } from '../helpers/index.js';

export default async ({collection, data}) => {
  const dbFormattedEcho = {
    text: data.text,
    location: {
      type: "Point",
      coordinates: [ data.coords.longitude, data.coords.latitude ]
    }
  };
  try {
    const inserted = await collection.insertOne(dbFormattedEcho);
    return toClientFormattedEcho(await collection.findOne(inserted.insertedId));
    
  } catch (err) {
    console.error(err);
  }
};