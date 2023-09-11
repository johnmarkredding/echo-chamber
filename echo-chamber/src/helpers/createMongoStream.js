'use strict';
import { Observable } from 'rxjs';

export default (args) => {
  const { collection, pipelineFilter } = args;
  return new Observable((subscriber) => {
    const echoChanges = collection.watch(pipelineFilter);
      
    echoChanges.on("change", (e) => subscriber.next(e));
    echoChanges.on("error", (err) => subscriber.error(err));
    echoChanges.on("close", (e) => subscriber.complete(e));
    return () => {
      echoChanges.close();
    }
  });
};