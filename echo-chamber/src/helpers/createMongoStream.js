'use strict';
import { Observable, startWith } from 'rxjs';

export default ({ collection, pipelineFilter }) => {
  const newMongoStream = new Observable((subscriber) => {
    const echoChanges = collection.watch(pipelineFilter);
    echoChanges.on("change", (e) => { subscriber.next(e) });
    echoChanges.on("error", (err) => { subscriber.error(err) });
    echoChanges.on("close", (closeEvent) => { subscriber.complete(closeEvent) });
    return () => { echoChanges.close() }
  });
  return newMongoStream.pipe(startWith("Initial event to load data"));
};