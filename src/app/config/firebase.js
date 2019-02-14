import firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcMkJ6to0rmo4rqpyyv6pKKmNAPlYb43E",
  authDomain: "revents-adfd8.firebaseapp.com",
  databaseURL: "https://revents-adfd8.firebaseio.com",
  projectId: "revents-adfd8",
  storageBucket: "revents-adfd8.appspot.com",
  messagingSenderId: "156850719355"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};

firestore.settings(settings);

export default firebase;
