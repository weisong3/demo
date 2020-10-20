const functions = require('firebase-functions');
const admin = require('firebase-admin')
const axios = require('axios')
admin.initializeApp(functions.config().firebase)

exports.updateLocation = functions.https.onRequest((request, response) => {
  functions.logger.info('location update: ' + JSON.stringify(request.body), {structuredData: true});
  const updateRecord = {
    uid: request.body.uid,
    longitude: request.body.longitude,
    latitude: request.body.latitude
  }
  admin.firestore().collection('locationUpdate').doc(request.body.timestamp.toString()).set(updateRecord)
  response.send({record: updateRecord, timestamp: request.body.timestamp});
});

exports.onLocationUpdateDBTrigger = functions.firestore.document('/locationUpdate/{timestamp}')
  .onCreate((snapshot, context) => {
    functions.logger.info('database event ' + snapshot.id + ': ' + JSON.stringify(snapshot.data()))
    const newLocation = {
      longitude: snapshot.data().longitude,
      latitude: snapshot.data().latitude
    }
    const distanceRef = admin.database().ref('/distance')
    return distanceRef.once('value', (records) => {
      if (!records.hasChild(snapshot.data().uid)) {
        return distanceRef.child(snapshot.data().uid).set({
          lastLocation: newLocation,
          totalDistance: 0
        })
      } else {
        const record = records.child(snapshot.data().uid).val()
        functions.logger.info('current record: ' + JSON.stringify(record))
        const oldLocation = record.lastLocation
        functions.logger.info('current record1: ' + JSON.stringify(oldLocation))
        const totalDistance = record.totalDistance
        const distanceToAdd = Math.abs(
          getDistanceFromLatLonInKm(
            newLocation.latitude,
            newLocation.longitude,
            oldLocation.latitude,
            oldLocation.longitude))
        functions.logger.info('distance to add = ' + distanceToAdd.toString())
        return distanceRef.child(snapshot.data().uid).set({
          lastLocation: newLocation,
          totalDistance: totalDistance + distanceToAdd
        })
      }
    })
  })

exports.runTest = functions.https.onRequest((request, response) => {
  const startLat = 33.835061
  const startLng = -118.019428
  for (let i = 1; i <= 10; i++) {
    let user = 'user_' + i.toString()
    let velocity = Math.random() * 0.01
    let timer = setTimeout(function testTimer(user, velocity, lat, lng) {
      postRequest(user, velocity, lat + velocity, lng + velocity)
      timer = setTimeout(testTimer, 1000, user, velocity, lat + velocity, lng + velocity)
    }, 1000, user, velocity, startLat, startLng)
    setTimeout(() => {
      clearTimeout(timer)
    }, 10000)
  }
  response.send('Finished')
});

const postRequest = (user, velocity, lat, lng) => {
  const payload = {
    timestamp: new Date().getTime(),
    uid: user,
    longitude: lng,
    latitude: lat
  }
  functions.logger.info("posting: " + JSON.stringify(payload))
  axios
    .post('http://localhost:5001/data-pipeline-function-to-bt/us-central1/updateLocation', payload)
}

const getDistanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}