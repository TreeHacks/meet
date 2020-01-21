import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import './index.scss';
import Table from './js/table';
import MeetForm from './js/form';
import * as serviceWorker from './js/serviceWorker';

function Main() {
  return (
    <BrowserRouter>
      <div>
        <ul>
          <li>
            <Link to="/">Table</Link>
          </li>
          <li>
            <Link to="/form">Form</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/form">
            <MeetForm />
          </Route>
          <Route path="/">
            <Table />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
