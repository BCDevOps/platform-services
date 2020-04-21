/*
Copyright 2019 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at 

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Created by Patrick Simonian
*/
import React, { useState } from 'react';
import { ClimbingBoxLoader } from 'react-spinners'
import './App.css';

import logoSVG from './images/logo.svg';


import axios from 'axios';


import { asyncPoll } from './utils'

const { REACT_APP_CSV_ROUTE, REACT_APP_MAX_SERVER_POLL_BEFORE_FAILURE, REACT_APP_POLL_INTERVAL} = process.env;
// converting envronment strings into nums
const POLL_INTERVAL = REACT_APP_POLL_INTERVAL / 1;
const MAX_SERVER_POLL_BEFORE_FAILURE = REACT_APP_MAX_SERVER_POLL_BEFORE_FAILURE / 1;
const Header = () => (

  <header>
    <div className="banner">
        <a href="https://gov.bc.ca" alt="British Columbia">
          <img src={logoSVG} width={150} alt="Go to the Government of British Columbia website" />
        </a>
        <h1>Repo Mapper Reporter</h1>
    </div>
  </header>
)


const fetchCSV = async () => {

  try {
    const response = await axios.get(REACT_APP_CSV_ROUTE);
    return response.status !== 200;

  } catch(e) {
    // file not found, keep polling
    return true;
  }
}

const validateCb = shouldPoll => shouldPoll;

const CSVLink = () =>  (
  <div className="container">
    <h2>
      Report Complete!
    </h2>
    <a href={REACT_APP_CSV_ROUTE} download>Download</a>
  </div>
)

const App = ()  => {
  const [polling, setPolling] = useState(false);
  const [fileExists, setFileExists] = useState(false);
  const [error, setError] = useState(null);
  const timeout = POLL_INTERVAL * MAX_SERVER_POLL_BEFORE_FAILURE;
  const pollForCSV = () => {
    if(!polling) {
      setPolling(true)
      asyncPoll(fetchCSV, validateCb, {interval: POLL_INTERVAL, timeout})
      .then(() => {
        setPolling(false);
        setFileExists(true);
      })
      .catch(() => {
        setPolling(false);
        setFileExists(false);
        setError(true);
      })
    }  
  }

  return (
    <React.Fragment>
      <Header />
      <main>
        <h1 style={{textAlign: "center"}}>Request a CSV report</h1>
        <div className="container">
          {fileExists  && <CSVLink />}
          {!polling && !error && !fileExists && <button className="BC-Gov-SecondaryButton" onClick={pollForCSV}>Start Report</button>}
          {polling && <h2>Generating Report <ClimbingBoxLoader /></h2>}
          {error && !polling && <div className="container">
            <div>
              <h2 style={{color: "#D8292F"}}>Report failed to generate within {timeout / 1000 } seconds. </h2>
            </div>
            <div>
              <button className="BC-Gov-SecondaryButton" onClick={pollForCSV}>Try Again</button>
            </div>
          </div>}
        </div>
      </main>
    </React.Fragment>
    
    
  );
}

export default App;
