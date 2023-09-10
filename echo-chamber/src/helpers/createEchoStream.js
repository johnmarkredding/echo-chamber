import { Observable } from 'rxjs';
import getEchoes from './getEchoes.js';

export default ({latitude, longitude}) => {
  return new Observable(subscriber => {
    try {
      // Setup GraphQL subscription
      subscriber.next(getEchoes({latitude, longitude}));
    } catch (setupError) {
      subscriber.error(setupError);
      console.error(setupError);
    }
    return () => {
      // Cleanup GraphQL subscription
    };
  });
};