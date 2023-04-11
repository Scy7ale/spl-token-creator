import WrappedWallet from "./WrappedWallet";
import {
    WalletProvider,
    useWallet,
    useConnection,
} from "@solana/wallet-adapter-react";
import {
    WalletModalProvider,
    WalletModalButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import React, { useEffect, useState } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import SPLTokenService from "./SPLTokenService";

function AppContent() {
    const { wallet, connected } = useWallet();
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [tokenService, setTokenService] = useState(null);

    useEffect(() => {
        if (connected) {
            const wrappedWallet = new WrappedWallet(wallet);
            setTokenService(new SPLTokenService(wrappedWallet));
            setIsWalletConnected(true);
        } else {
            setTokenService(null);
            setIsWalletConnected(false);
        }
    }, [wallet, connected]);

    const handleCreateToken = async () => {
        try {
            if (!isWalletConnected || !tokenService) {
                throw new Error("Wallet not connected");
            }
            const mintAddress = await tokenService.createMint();
            alert(`Token created with mint address: ${mintAddress.toBase58()}`);
        } catch (error) {
            console.error(error);
            alert(`Error creating token: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Create SPL Token</h1>
            <button onClick={handleCreateToken}>Create Token</button>
            <WalletModalButton>Connect Wallet</WalletModalButton>
        </div>
    );
}


function App() {
    const network = "https://api.devnet.solana.com";

    const wallets = [
        {
            name: "Phantom",
            adapter: PhantomWalletAdapter,
            icon: "https://www.phantom.app/img/logo_small.png",
        },
    ];

    return (
        <ConnectionProvider endpoint={network}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <AppContent />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
