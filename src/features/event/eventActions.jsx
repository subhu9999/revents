import { toastr } from "react-redux-toastr";
import {
  CREATE_EVENT,
  UPDATE_EVENT,
  DELETE_EVENT,
  FETCH_EVENTS
} from "./eventConstants";

import {
  asyncActionStart,
  asyncActionFinish,
  asyncActionError
} from "../async/asyncActions";

import { fetchSampleData } from "../../app/data/mockApi";

export const fetchEvents = events => {
  return {
    type: FETCH_EVENTS,
    payload: events
  };
};

export const createEvent = event => {
  return async dispatch => {
    try {
      dispatch({
        type: CREATE_EVENT,
        payload: {
          event
        }
      });
      toastr.success("Success !", "Event Has Been Created");
    } catch (error) {
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const updateEvent = event => {
  return async dispatch => {
    try {
      dispatch({
        type: UPDATE_EVENT,
        payload: {
          event
        }
      });
      toastr.success("Success !", "Event Has Been Updated");
    } catch (error) {
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const deleteEvent = eventId => {
  return {
    type: DELETE_EVENT,
    payload: {
      eventId
    }
  };
};

export const loadEvents = () => {
  return async dispatch => {
    try {
      dispatch(asyncActionStart());
      let events = await fetchSampleData(); //wait for fetchSampleData to return results
      dispatch(fetchEvents(events));
      dispatch(asyncActionFinish());
    } catch (error) {
      console.log(error);
      dispatch(asyncActionError());
    }
  };
};
