export default (coords) => {
  const getDummyMessage = () => {
    return { text: 'Help from server!', id: Math.random(), coords};
  }

  return [
    getDummyMessage(),
    getDummyMessage(),
    getDummyMessage()
  ];
};