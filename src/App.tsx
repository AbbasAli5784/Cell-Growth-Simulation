import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Grid from "./components/Grid";
import "./components/Cell.css";

function App() {
  return (
    <div className="App">
      <h1>Grid Simulation</h1>
      <div className="grid-container">
        <Grid />
      </div>
    </div>
  );
}

export default App;
