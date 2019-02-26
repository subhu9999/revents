import { toastr } from "react-redux-toastr";
import { DELETE_EVENT, FETCH_EVENTS } from "./eventConstants";
import moment from "moment";
import {
  asyncActionStart,
  asyncActionFinish,
  asyncActionError
} from "../async/asyncActions";

import { fetchSampleData } from "../../app/data/mockApi";
import { createNewEvent } from "../../app/common/util/helpers";
import firebase from "../../app/config/firebase";

export const createEvent = event => {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const user = firestore.auth().currentUser;
    //photo URL from firebase redux store
    const photoURL = getState().firebase.profile.photoURL;
    let newEvent = createNewEvent(user, photoURL, event);
    try {
      //add the new event to events collection
      let createdEvent = await firestore.add("events", newEvent);

      //settings extra data for future use -- creating(first time)/setting a new collection with extra details
      await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
        eventId: createdEvent.id,
        userUid: user.uid,
        eventDate: event.date,
        host: true
      });
      toastr.success("Success !", "Event Has Been Created");
    } catch (error) {
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const updateEvent = event => {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();

    if (event.date !== getState().firestore.ordered.events[0].date) {
      //converting date to javascript date
      event.date = moment(event.date).toDate();
    }

    try {
      await firestore.update(`events/${event.id}`, event);
      toastr.success("Success !", "Event Has Been Updated");
    } catch (error) {
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const cancelToggle = (cancelled, eventId) => async (
  dispatch,
  getState,
  { getFirestore }
) => {
  const firestore = getFirestore();
  const message = cancelled
    ? "Are you sure you want to cancel the event ?"
    : "This Event will be reactivated - Are you Sure ?";
  try {
    toastr.confirm(message, {
      onOk: () =>
        firestore.update(`events/${eventId}`, {
          cancelled: cancelled
        })
    });
  } catch (error) {
    console.log(error);
  }
};

//lastEvent - last event returned by firestore?
export const getEventsForDashboard = lastEvent => async (
  dispatch,
  getState
) => {
  let today = new Date(Date.now());
  const firestore = firebase.firestore();
  const eventsRef = firestore.collection("events");
  try {
    dispatch(asyncActionStart());
    let startAfter =
      lastEvent &&
      (await firestore
        .collection("events")
        .doc(lastEvent.id)
        .get());
    let query;

    lastEvent
      ? (query = eventsRef
          .where("date", ">=", today)
          .orderBy("date")
          .startAfter(startAfter)
          .limit(2))
      : (query = eventsRef
          .where("date", ">=", today)
          .orderBy("date")
          .limit(2));
    let querySnap = await query.get();

    //return if no docs found
    if (querySnap.docs.length === 0) {
      dispatch(asyncActionFinish());
      return querySnap;
    }

    let events = [];

    for (let i = 0; i < querySnap.docs.length; i++) {
      let evt = { ...querySnap.docs[i].data(), id: querySnap.docs[i].id };
      events.push(evt);
    }
    //adding events to own redux
    dispatch({ type: FETCH_EVENTS, payload: { events } });
    dispatch(asyncActionFinish());
    return querySnap;
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
  }
};
