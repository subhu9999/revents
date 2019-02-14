import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import ReduxToastr from "react-redux-toastr";
import "./index.css";
import App from "./app/layout/App";
import * as serviceWorker from "./serviceWorker";
import { configureStore } from "./app/store/configureStore";
import ScrollToTop from "./app/common/util/ScrollToTop";

const store = configureStore();

//for using hot reload - update pages without reload

const rootEl = document.getElementById("root");

let render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop>
          <ReduxToastr
            position="bottom-right"
            transitionIn="fadeIn"
            trnasitionOut="fadeOut"
          />
          <App />
        </ScrollToTop>
      </BrowserRouter>
    </Provider>,
    rootEl
  );
};

if (module.hot) {
  module.hot.accept("./app/layout/App", () => {
    setTimeout(render);
  });
}

//to render the app only after firebase auth is loaded - to  prevent errors - as component mount first before auth state loads
store.firebaseAuthIsReady.then(() => {
  render();
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
