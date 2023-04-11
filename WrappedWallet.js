class WrappedWallet {
    constructor(wallet) {
        this.wallet = wallet;
    }

    get publicKey() {
        return this.wallet.publicKey;
    }

    async signTransaction(transaction) {
        return await this.wallet.signTransaction(transaction);
    }

    async signAllTransactions(transactions) {
        return await this.wallet.signAllTransactions(transactions);
    }
}

export default WrappedWallet;
