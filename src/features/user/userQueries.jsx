export const userDetailedQuery = ({ auth, userUid }) => {
  //if user the is viewing other user profile
  if (userUid !== null) {
    return [
      {
        collection: "users",
        doc: userUid,
        storeAs: "profile"
      },
      {
        collection: "users",
        doc: userUid,
        subcollections: [{ collection: "photos" }],
        storeAs: "photos"
      }
    ];
  } else {
    return [
      {
        collection: "users",
        doc: auth.uid,
        subcollections: [{ collection: "photos" }],
        storeAs: "photos"
      }
    ];
  }
};
