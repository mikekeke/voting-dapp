import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import { Wallet } from './Wallet';
import { Proposals } from './Proposals';
import {ICurrentKey} from './AppTypes'
import { Wallet } from './Wallet';
// import Wallet from './Wallet';



function App() {
  const [pubKey, setPubKey] = useState<ICurrentKey>({ pubKey: undefined });

  const setKey = (keyHash: string) => {
    setPubKey({pubKey: keyHash})
  }

  return (
    <div className="App">
      <p>Current key: {pubKey.pubKey}</p>
      <Wallet 
        pubKey={pubKey}
        setKey={setKey}
        />
      <Proposals/>
    </div>
  );
}

export default App;