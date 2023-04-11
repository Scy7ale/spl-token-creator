import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

class SPLTokenService {
    constructor(wallet) {
        this.wallet = wallet;
        this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    }

    async createMint(decimals = 9) {
        const mintAuthority = Keypair.generate();
        const freezeAuthority = Keypair.generate();
        const mintRent = await this.connection.getMinimumBalanceForRentExemption(82);
        const mintAccount = Keypair.generate();
        const createMintIx = Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID,
            mintAccount.publicKey,
            decimals,
            mintAuthority.publicKey,
            freezeAuthority.publicKey
        );
        const createAccountIx = SystemProgram.createAccount({
            fromPubkey: this.wallet.publicKey,
            newAccountPubkey: mintAccount.publicKey,
            lamports: mintRent,
            space: 82,
            programId: TOKEN_PROGRAM_ID,
        });
        const transaction = new Transaction().add(createAccountIx, createMintIx);
        transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
        transaction.feePayer = this.wallet.publicKey;
        const signedTransaction = await this.wallet.signTransaction(transaction);
        const txid = await this.connection.sendRawTransaction(signedTransaction.serialize());
        await this.connection.confirmTransaction(txid);
        return mintAccount.publicKey;
    }

    async getMintInfo(mint) {
        const mintInfo = await mint.getMintInfo(this.connection);
        return mintInfo;
    }

    async getTokenAccount(mint) {
        const tokenAccount = await mint.getOrCreateAssociatedAccountInfo(this.wallet.publicKey);
        return tokenAccount;
    }

    async getTokenAccountInfo(mint, tokenAccountAddress) {
        const token = new Token(this.connection, mint, Token.programId, this.wallet);
        const tokenAccountInfo = await token.getAccountInfo(tokenAccountAddress);
        return tokenAccountInfo;
    }
}

export default SPLTokenService;
