import React from "react";
import { connect } from "react-redux";
import { Grid } from "semantic-ui-react";
import SettingsNav from "./SettingsNav";
import { Switch, Route, Redirect } from "react-router-dom";
import BasicPage from "./BasicPage";
import AboutPage from "./AboutPage";
import PhotosPage from "./PhotosPage";
import AccountPage from "./AccountPage";
import { updatePassword } from "../../auth/authActions";
import { updateProfile } from "../userActions";

const actions = {
  updatePassword,
  updateProfile
};

const mapState = state => ({
  providerId: state.firebase.auth.providerData[0].providerId,
  user: state.firebase.profile
});

const SettingsDashboard = ({
  updateProfile,
  updatePassword,
  providerId,
  user
}) => {
  return (
    <Grid>
      <Grid.Column width={12}>
        <Switch>
          <Redirect exact from="/settings" to="/settings/basic" />
          {/* passing initial values of using redux-form initialValues*/}
          <Route
            path="/settings/basic"
            render={() => (
              <BasicPage initialValues={user} updateProfile={updateProfile} />
            )}
          />
          <Route
            path="/settings/about"
            render={() => (
              <AboutPage updateProfile={updateProfile} initialValues={user} />
            )}
          />
          <Route path="/settings/photos" component={PhotosPage} />
          {/* use render while passing props to components */}
          <Route
            path="/settings/account"
            render={() => (
              <AccountPage
                updatePassword={updatePassword}
                providerId={providerId}
              />
            )}
          />
        </Switch>
      </Grid.Column>
      <Grid.Column width={4}>
        <SettingsNav />
      </Grid.Column>
    </Grid>
  );
};

export default connect(
  mapState,
  actions
)(SettingsDashboard);
