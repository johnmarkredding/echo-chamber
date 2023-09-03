export default (coords) => {
  const getDummyMessage = () => {
    return { text: 'Help from server!', id: Math.random(), coords: {latitude: Math.random(), longitude: Math.random()}};
  }

  return [
    getDummyMessage(),
    getDummyMessage(),
    getDummyMessage()
  ];
};