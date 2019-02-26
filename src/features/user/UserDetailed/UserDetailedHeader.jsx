import React from "react";
import { Grid, Segment, Item, Header } from "semantic-ui-react";
import differenceInYears from "date-fns/difference_in_years";

const UserDetailedHeader = ({ userProfile }) => {
  let age;
  if (userProfile.dateOfBirth) {
    age = differenceInYears(Date.now(), userProfile.dateOfBirth.toDate());
  } else {
    age = "unknown age";
  }
  return (
    <Grid.Column width={16}>
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image
              avatar
              size="small"
              src={userProfile.photoURL || "/assets/user.png"}
            />
            <Item.Content verticalAlign="bottom">
              <Header as="h1">{userProfile.displayName}</Header>
              <br />
              <Header as="h3">{userProfile.occupation}</Header>
              <br />
              <Header as="h3">
                {age} , Lives in {userProfile.city || "unknown city"}
              </Header>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
    </Grid.Column>
  );
};

export default UserDetailedHeader;
