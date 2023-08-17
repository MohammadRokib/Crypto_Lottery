import { useMoralis } from "react-moralis";
import { useEffect } from "react";

function ManualHeader() {
  const { account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading, enableWeb3 } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) enableWeb3();
    }
  }, [isWeb3Enabled]);

// Removing the connected status from the local storage
  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to: ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <div>
      {account ? (
        <div>Connected account: {account    .slice(0,6)}...{account.slice(account.length-4)}</div>
      ):(
        <button
          onClick={async () => {
            await enableWeb3()
            if (typeof window !== "undefined") {
              window.localStorage.setItem("connected", "inject");
            }
          }}
          disabled={isWeb3EnableLoading}
        >Connect</button>
      )}
    </div>
  );
}

export default ManualHeader;
