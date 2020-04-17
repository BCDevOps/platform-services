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
import React from 'react';

import './App.css';

import logoSVG from './images/logo.svg';

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

const App = ()  => {
  return (
    <React.Fragment>
      <Header />
      <main>
        <h1 style={{textAlign: "center"}}>Request a CSV report</h1>
        <div class="container">
          <button className="BC-Gov-SecondaryButton">Start Report</button>
        </div>
      </main>
    </React.Fragment>
    
    
  );
}

export default App;
