import React from 'react';
import './App.css';
import Game from './components/Game';

function App() {
  return (
    <div className="App">
      <h1>Надо кликать на "бросить кубик", чтобы бросить кубик</h1>
      <Game />
    </div>
  );
}

export default App;