import { useEffect } from 'react';
import { ICurrentKey } from './AppTypes'

declare global {
  interface Window {
    CasperWalletProvider: any;
  }
}
const CasperWalletProvider = window.CasperWalletProvider;

const provider = CasperWalletProvider();

export const Wallet: React.FC<{
  pubKey: ICurrentKey,
  setKey: (keyHash: string) => void,
}> = ({ pubKey, setKey }) => {

  return (
    <button onClick={() => { connect().catch(err => alert(err)) }}>Connect to wallet</button>
  )

  async function connect() {
    const connected: boolean = await provider.requestConnection();
    if (!connected) {
      throw new Error("Could not connect to wallet")
    }
    const keyHash: string = await provider.getActivePublicKey();
    setKey(keyHash)
  }
};