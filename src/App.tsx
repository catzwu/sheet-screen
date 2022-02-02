// @ts-nocheck
/* global gapi */
import { React, useEffect, useState, useContext, useMemo, createContext } from 'react';
import './App.css';
import { listSheets, getHeadings } from './gapi.tsx';
import SpreadsheetSelector from './SpreadsheetSelector.tsx';
import Gallery from './Gallery.tsx';

//import { GoogleSpreadsheet } from 'google-spreadsheet';
//const gapi = require('./google-api.js');
//const { GoogleSpreadsheet } = require('google-spreadsheet');
//let gapi = window.gapi;

var CLIENT_ID = '915610201998-pojqu8oncqnhaa21st7ddfrt0augft4e.apps.googleusercontent.com';
var API_KEY = 'AIzaSyA7-aJkgvuNTSIEMIuzLQdUZ4D9xKy1xfE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

// var initSpreadsheetId = '1nQHh-6HjdYcYKwi-nHaU7xbKQlHU41EzO1-fvs9250Y';


export const SpreadsheetContext = createContext({
  spreadsheetId: {},
  setSpreadsheetId: () => { },
});

function App() {
  const [profile, setProfile] = useState();
  const [isLoaded, setLoaded] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState({});
  const spreadsheetContextValue = useMemo(
    () => ({ spreadsheet, setSpreadsheet }), [spreadsheet]
  );

  var authorizeButton;
  var signoutButton;

  useEffect(() => {
    const script = document.createElement('script');

    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = handleClientLoad;

    document.body.appendChild(script);
    authorizeButton = document.getElementById('authorize_button');
    signoutButton = document.getElementById('signout_button');


    return () => {
      document.body.removeChild(script);
    }
  })

  function handleClientLoad() {
    window.gapi.load('client:auth2', initClient);
  }

  function initClient() {
    window.gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      var auth2 = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      auth2.isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(auth2.isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;


      setLoaded(true);
    }, function (error) {
      console.log(JSON.stringify(error, null, 2));
    });

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedInVar) {
      var auth2 = gapi.auth2.getAuthInstance();
      var auth_profile = auth2?.currentUser.get().getBasicProfile();

      if (isSignedInVar) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        setProfile(auth_profile);
      } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        setProfile(null);
      }

    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
      gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    async function handleSignoutClick(event) {
      gapi.auth2.getAuthInstance().signOut();

      //Try to log out of sheets when you log out

      // setLoaded(false);
      // await getSpreadsheet(getSpreadsheetId(spreadsheet)).then(
      //   () => {
      //     console.log('spreadsheet permitted');
      //     setLoaded(true);
      //   }
      // ).catch((error) => {
      //   console.error(error);
      //   setSpreadsheet({});
      //   console.log('spreadsheet not permitted')
      //   setLoaded(true);
      // });

    }
  }

  const base = isLoaded ? <Base /> : null;

  return (
    <div className="App">
      <header className="App-header">
        <p className="logo">SheetScreen</p>
        <div>
          <p>{profile ? profile.getName() : 'not signed in'}</p>
          <button id="authorize_button" style={{ display: 'none' }}>Log In</button>
          <button id="signout_button" style={{ display: 'none' }}>Sign Out</button>
        </div>

      </header>
      <SpreadsheetContext.Provider value={spreadsheetContextValue}>
        <div className=" ">
          {isLoaded ? <SpreadsheetSelector /> : null}
        </div>
        {base}


      </SpreadsheetContext.Provider>

    </div>
  );
}

export default App;

export function Base() {
  const [sheets, setSheets] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [isSpreadsheetLoaded, setSpreadsheetLoaded] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { spreadsheet } = useContext(SpreadsheetContext);

  useEffect(() => {
    if (spreadsheet && Object.keys(spreadsheet).length !== 0) {
      setSpreadsheetLoaded(true);
      setSheets(listSheets(spreadsheet));
      setHeadings([]);
    }
    // (async function blah() {
    //   setLoading(true);
    //   const spreadsheet = await getSpreadsheet(initSpreadsheetId);
    //   setSpreadsheet(spreadsheet);
    //   setSheets(listSheets(spreadsheet));
    //   setSpreadsheetLoaded(true);
    //   setLoading(false);
    // })();
  }, [spreadsheet])

  // useEffect(() => {

  //     setSheets(listSheets(spreadsheet));
  //     setHeadings([]);

  // }, [spreadsheet])

  function toggleCheck(i) {
    let newHeadings = headings.map(a => { return { ...a } })
      ;
    newHeadings[i].checked = !newHeadings[i].checked;
    setHeadings(newHeadings);
  }

  function setAllChecks() {
    let newHeadings = headings.map(a => { return { ...a } })
      ;
    var checkedState = true;
    for (var i = 0; i < newHeadings.length; i++) {
      checkedState = checkedState && newHeadings[i].checked;
    }
    for (var j = 0; j < newHeadings.length; j++) {
      newHeadings[j].checked = !checkedState;
    }
    setHeadings(newHeadings);
  }


  return (
    <div className="main">
      <div className="side-nav | bg-contrast">
        <p className="sidebar-label">Sheets</p>
        <div className="sheet-list">
          {
            sheets.map((x) => (
              <Sheet
                keyName={x + '-sheet'}
                key={x + '-sheet'}
                isSelectedSheet={selectedSheet === x}
                onClick={async () => {
                  setLoading(true);
                  let headings = getHeadings(spreadsheet, x);
                  setHeadings(headings);
                  setSelectedSheet(x);
                  setLoading(false);
                }}
                value={x}
              />
            ))
          }
        </div>

      </div>


      <div className="main-report-display">
        {isLoading ? <p>Loading...</p> : null}

        {selectedSheet
          ? <Gallery selectedSheet={selectedSheet} headings={headings} />
          : (isSpreadsheetLoaded ? <EmptySheetState /> : null)}
      </div>

      {selectedSheet ? <SettingsSidebar setAllChecks={setAllChecks} headings={headings}
        toggleCheck={toggleCheck} /> : null}


    </div>


  );
}

function Sheet(props) {

  return (
    <div className='sheet | container' key={props.keyName}>
      <button
        className={(props.isSelectedSheet ? 'sheet-button-selected' : 'sheet-button') + ' | button wrapper'}
        onClick={props.onClick}>
        {props.value}
      </button>
    </div >
  )
}

function EmptySheetState(props) {
  return (
    <div className="empty-sheet">
      <p>Select a sheet to start</p>
    </div>
  )
}

function SettingsSidebar(props) {
  return (
    <div className="side-nav | bg-contrast">
      <p className="sidebar-label">Headings:</p>
      <div className="wrapper">

        <button className="button tertiary-button" id='select_all' onClick={props.setAllChecks}>Select/deselect all</button>
        {props.headings.map((x, i) => (
          <div className="heading-checkbox-container">
            <label className="heading-checkbox">
              <input type='checkbox' checked={x.checked} onChange={() => props.toggleCheck(i)} />
              {x.value}
              <a className="checkbox-column-name">{x.column}</a>
            </label>
          </div>

        ))}
      </div>

    </div>
  )

}