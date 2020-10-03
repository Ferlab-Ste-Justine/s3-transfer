const { of, from, Observable } = require('rxjs')
const { mergeMap, map } = require('rxjs/operators')
const R = require('ramda')

const { ensureFileExists$, readFile$ } = require('./files')
const { configAccessors } = require('./structures')

const getSourceCredentials$ = (config) => {
  const setCredentials = R.set(configAccessors.sourceCredentialsLens, R.__, config)
  if(configAccessors.sourceIsS3(config)) {
    return ensureFileExists$(configAccessors.sourceCredentialsPath(config))
      .pipe(mergeMap(readFile$(JSON.parse)))
      .pipe(map(setCredentials))
  } else {
    return of(config)
  }
}

const getDestinationCredentials$ = (config) => {
  const setCredentials = R.set(configAccessors.destinationCredentialsLens, R.__, config)
  return ensureFileExists$(configAccessors.destinationCredentialsPath(config))
    .pipe(mergeMap(readFile$(JSON.parse)))
    .pipe(map(setCredentials))
}

const getConfig$ = (configPath) => {
  return of(configPath)
    .pipe(mergeMap(ensureFileExists$))
    .pipe(mergeMap(readFile$(JSON.parse)))
    .pipe(mergeMap(getSourceCredentials$))
    .pipe(mergeMap(getDestinationCredentials$))
}

module.exports = { getConfig$ }