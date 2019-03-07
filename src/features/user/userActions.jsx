import moment from "moment";
import { toastr } from "react-redux-toastr";
import cuid from "cuid";
import {
  asyncActionStart,
  asyncActionFinish,
  asyncActionError
} from "../async/asyncActions";
import { FETCH_EVENTS } from "../event/eventConstants";
import firebase from "../../app/config/firebase";

export const updateProfile = user => async (
  dispatch,
  getState,
  { getFirebase }
) => {
  const firebase = getFirebase();

  //extracting a copy of updatedUser in updatedUser without isLoaded & isEmpty
  const { isLoaded, isEmpty, ...updatedUser } = user;
  //converts moment object to javascript date --for firebase
  if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
    updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
  }
  try {
    await firebase.updateProfile(updatedUser); //rract-redux-firebase method
    toastr.success("Success", "Profile Updated");
  } catch (error) {
    console.log(error);
  }
};

export const uploadProfileImage = (file, fileName) => async (
  dispatch,
  getState,
  { getFirebase, getFirestore }
) => {
  const imageName = cuid();
  const firebase = getFirebase();
  const firestore = getFirestore();
  const user = firebase.auth().currentUser;
  const path = `${user.uid}/user_images`;
  const options = {
    name: imageName
  };

  try {
    dispatch(asyncActionStart());
    //upload the file to firebase storage
    let uploadedFile = await firebase.uploadFile(path, file, null, options);
    //get url of image
    let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;
    // get userdoc
    let userDoc = await firestore.get(`users/${user.uid}`);
    //check if user has photo, if not update profile with new image
    if (!userDoc.data().photoURL) {
      await firebase.updateProfile({
        //in firebase profile
        photoURL: downloadURL
      });
      await user.updateProfile({
        //in profile photo
        photoURL: downloadURL
      });
    }
    //add the new photo to photos collection
    await firestore.add(
      {
        collection: "users",
        doc: user.uid,
        subcollections: [{ collection: "photos" }]
      },
      {
        name: imageName,
        url: downloadURL
      }
    );
    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    throw new Error("Problem uploading photo");
  }
};

export const deletePhoto = photo => async (
  dispatch,
  getState,
  { getFirebase, getFirestore }
) => {
  const firebase = getFirebase();
  const firestore = getFirestore();
  const user = firebase.auth().currentUser;
  try {
    await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
    await firestore.delete({
      collection: "users",
      doc: user.uid,
      subcollections: [{ collection: "photos", doc: photo.id }]
    });
  } catch (error) {
    console.log(error);
    throw new Error("Problem deleting the photo");
  }
};

export const setMainPhoto = photo => async (dispatch, getState) => {
  dispatch(asyncActionStart());
  const firestore = firebase.firestore();
  const user = firebase.auth().currentUser;
  const today = new Date(Date.now());
  let userDocRef = firestore.collection("users").doc(user.uid);
  let eventAttendeeRef = firestore.collection("event_attendee");
  try {
    let batch = firestore.batch();

    await batch.update(userDocRef, {
      photoURL: photo.url
    });

    let eventQuery = await eventAttendeeRef
      .where("userUid", "==", user.uid)
      .where("eventDate", ">", today);

    let eventQuerySnap = await eventQuery.get();

    //updating photos in all the attending events
    for (let i = 0; i < eventQuerySnap.docs.length; i++) {
      let eventDocRef = await firestore
        .collection("events")
        .doc(eventQuerySnap.docs[i].data().eventId);

      let event = await eventDocRef.get();
      //if the user is host of event
      if (event.data().hostUid === user.uid) {
        batch.update(eventDocRef, {
          hostPhotoURL: photo.url,
          [`attendees.${user.uid}.photoURL`]: photo.url
        });
      } else {
        batch.update(eventDocRef, {
          [`attendees.${user.uid}.photoURL`]: photo.url
        });
      }
    }

    console.log(batch);
    await batch.commit();
    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    throw new Error("Problem Setting Main Photo");
  }
};

export const goingToEvent = event => async (dispatch, getState) => {
  asyncActionStart();
  const firestore = firebase.firestore();
  const user = firebase.auth().currentUser;
  const photoURL = getState().firebase.profile.photoURL;
  const attendee = {
    going: true,
    joinDate: Date.now(),
    photoURL: photoURL || "/assets/user.png",
    displayName: user.displayName,
    host: false
  };
  try {
    let eventDocRef = firestore.collection("events").doc(event.id);
    let eventAttendeeDocRef = firestore
      .collection("event_attendee")
      .doc(`${event.id}_${user.uid}`);

    //to use re-excecute the function if the event changes(if the user trys to join the event while the event is updating - )
    await firestore.runTransaction(async transaction => {
      //tracking for any changes
      await transaction.get(eventDocRef);

      await transaction.update(eventDocRef, {
        [`attendees.${user.uid}`]: attendee
      });

      await transaction.set(eventAttendeeDocRef, {
        eventId: event.id,
        userUid: user.uid,
        eventDate: event.date,
        host: false
      });
    });

    // await firestore.update(`events/${event.id}`, {
    //   [`attendees.${user.uid}`]: attendee
    // });
    // await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
    //   eventId: event.id,
    //   userUid: user.uid,
    //   eventDate: event.date,
    //   host: false
    // });
    dispatch(asyncActionFinish());
    toastr.success("Success", "You have signed up to the event");
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    toastr.error("Oops", "Problem signing up to event");
  }
};

export const cancelGoingToEvent = event => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  const firestore = getFirestore();
  const user = firestore.auth().currentUser;
  try {
    await firestore.update(`events/${event.id}`, {
      //deleting a single filed from firestore doc
      [`attendees.${user.uid}`]: firestore.FieldValue.delete()
    });

    //removing attendee data from lookup
    await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
    toastr.success("Success", "You have removed yourself from event");
  } catch (error) {
    console.log(error);
    toastr.error("oops", "something went wrong");
  }
};

export const getUserEvents = (userUid, activeTab) => async (
  dispatch,
  getState
) => {
  dispatch(asyncActionStart());
  const firestore = firebase.firestore();
  const today = new Date(Date.now());
  let eventsRef = firestore.collection("event_attendee");
  let query;
  switch (activeTab) {
    case 1: //past events
      query = eventsRef
        .where("userUid", "==", userUid)
        .where("eventDate", "<=", today)
        .orderBy("eventDate", "desc");
      break;
    case 2: //future events
      query = eventsRef
        .where("userUid", "==", userUid)
        .where("eventDate", ">=", today)
        .orderBy("eventDate");
      break;
    case 3: //hosted events
      query = eventsRef
        .where("userUid", "==", userUid)
        .where("host", "==", true)
        .orderBy("eventDate", "desc");
      break;
    default:
      query = eventsRef
        .where("userUid", "==", userUid)
        .orderBy("eventDate", "desc");
  }

  try {
    let querySnap = await query.get();
    let events = [];

    //retrieving the actual data
    for (let i = 0; i < querySnap.docs.length; i++) {
      let evt = await firestore
        .collection("events")
        .doc(querySnap.docs[i].data().eventId)
        .get();

      events.push({ ...evt.data(), id: evt.id });
    }

    dispatch({ type: FETCH_EVENTS, payload: { events } });

    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
  }
};
