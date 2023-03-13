// Style imports.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

// React imports.
import React, { useState } from "react";
import ReactDOM from "react-dom/client";


// App imports.
import LoginView from "./components/LoginView";
import RegisterView from "./components/RegisterView";
import ContactsView from './components/ContactsView';
import MessagesView from './components/MessagesView';
import LandingView from './components/LandingView';

function App() {
  const [state, setState] = useState({view: "landing", user: null, contact: null});

  if(state.view == "landing") {
    return <LandingView setState={setState} />
  }
  else if(state.view == "login") {
    return <LoginView setState={setState} />
  }
  else if(state.view == "register") {
    return <RegisterView setState={setState} />
  }
  else if(state.view == "contacts") {
    return <ContactsView setState={setState} user={state.user}/>
  }
  else if(state.view == "messages") {
    return <MessagesView setState={setState} user={state.user} contact={state.contact}/> 
  }
}

// Render the UI.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>)
