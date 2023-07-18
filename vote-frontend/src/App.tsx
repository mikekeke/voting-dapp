import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Wallet } from './Wallet';
import { Proposals } from './Proposals';
import {ICurrentKey} from './AppTypes'
// import Wallet from './Wallet';



function App() {
  const [pubKey, setPubKey] = useState<ICurrentKey>({ pubKey: undefined });

  return (
    <div className="App">
      {/* <Wallet pubKey={pubKey} /> */}
      <Proposals/>
    </div>
  );
}



export default App;

