'use strict'

export default ({ _id, text, location }) => ({
  id: _id.toString(),
  text,
  coords: {
    longitude: location.coordinates[0],
    latitude: location.coordinates[1]
  },
  timestamp: _id.getTimestamp()
});