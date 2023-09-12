'use strict'
export default async ({collection, data}) => {
  const dbFormattedEcho = {
    text: data.text,
    location: {
      type: "Point",
      coordinates: [ data.coords.latitude, data.coords.longitude ]
    }
  };
  try {
    const inserted = await collection.insertOne(dbFormattedEcho);
    const { _id, text, location } = await collection.findOne(inserted.insertedId);
    
    const clientFormattedEcho = {
      id: _id.toString(),
      text: text,
      coords: {
        latitude: location.coordinates[0],
        longitude: location.coordinates[1]
      }
    };

    return clientFormattedEcho;
  } catch (err) {
    console.error(err);
  }
};