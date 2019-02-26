import React from "react";
import { Grid, Segment, Header, Icon, Item, List } from "semantic-ui-react";
import format from "date-fns/format";

const UserDetailedMain = ({ userProfile }) => {
  let createdAt;
  if (userProfile.createdAt) {
    createdAt = format(userProfile.createdAt.toDate(), "D MMM YYYY");
  } else {
    createdAt = "NA";
  }
  return (
    <Grid.Column width={12}>
      <Segment>
        <Grid columns={2}>
          <Grid.Column width={10}>
            <Header icon="smile" content={"About " + userProfile.displayName} />
            <p>
              I am a: <strong>{userProfile.occupation || "tbn"}</strong>
            </p>
            <p>
              Originally from <strong>{userProfile.origin || "tbn"}</strong>
            </p>
            <p>
              Member Since: <strong>{createdAt}</strong>
            </p>
            <p>{userProfile.about}</p>
          </Grid.Column>
          <Grid.Column width={6}>
            <Header icon="heart outline" content="Interests" />
            {userProfile.interests ? (
              <List>
                {userProfile.interests &&
                  userProfile.interests.map((interest, index) => (
                    <Item key={index}>
                      <Icon name="heart" />
                      <Item.Content>{interest}</Item.Content>
                    </Item>
                  ))}
              </List>
            ) : (
              <p>No Interests</p>
            )}
          </Grid.Column>
        </Grid>
      </Segment>
    </Grid.Column>
  );
};

export default UserDetailedMain;
