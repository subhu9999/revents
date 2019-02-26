import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import UserDetailedHeader from "./UserDetailedHeader";

import { connect } from "react-redux";
import UserDetailedMain from "./UserDetailedMain";
import UserDetailedPhotos from "./UserDetailedPhotos";
import UserDetailedSidebar from "./UserDetailedSidebar";

//firestore needs to be connected every time we try to access it
import { firestoreConnect, isEmpty } from "react-redux-firebase";
//to connect to more than 1 redux store
import { compose } from "redux";
import UserDetailedEvents from "./UserDetailedEvents";
import { userDetailedQuery } from "../userQueries";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { getUserEvents } from "../userActions";

const mapState = (state, ownProps) => {
  let userUid = null;
  let profile = {};

  if (ownProps.match.params.id === state.auth.uid) {
    profile = state.firebase.profile;
  } else {
    profile =
      !isEmpty(state.firestore.ordered.profile) &&
      state.firestore.ordered.profile[0];
    userUid = ownProps.match.params.id;
  }
  return {
    userProfile: profile,
    userUid,
    events: state.events,
    eventsLoading: state.async.loading,
    photos: state.firestore.ordered.photos,
    auth: state.firebase.auth,
    requesting: state.firestore.status.requesting
  };
};

const actions = {
  getUserEvents
};

class UserDetailedPage extends Component {
  async componentDidMount() {
    let events = await this.props.getUserEvents(this.props.userUid);

    console.log(events);
  }

  changeTab = (e, data) => {
    this.props.getUserEvents(this.props.userUid, data.activeIndex);
  };

  render() {
    const {
      userProfile,
      photos,
      auth,
      match,
      requesting,
      events,
      eventsLoading
    } = this.props;
    const isCurrentUser = auth.uid === match.params.id;
    //checking if some values in requesting object(firestore-object) are true
    const loading = Object.values(requesting).some(a => a === true);

    if (loading) return <LoadingComponent inverted={true} />;
    return (
      <Grid>
        <UserDetailedHeader userProfile={userProfile} />
        <UserDetailedMain userProfile={userProfile} />
        <UserDetailedSidebar isCurrentUser={isCurrentUser} />

        {photos && photos.length > 0 && <UserDetailedPhotos photos={photos} />}
        <UserDetailedEvents
          events={events}
          eventsLoading={eventsLoading}
          changeTab={this.changeTab}
        />
      </Grid>
    );
  }
}

export default compose(
  connect(
    mapState,
    actions
  ),
  firestoreConnect((auth, userUid) => userDetailedQuery(auth, userUid))
)(UserDetailedPage);
