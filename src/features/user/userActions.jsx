import moment from "moment";
import { toastr } from "react-redux-toastr";

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
