// @flow

const Wallet = require('../wallet/wallet');
const Transaction = require('../wallet/transaction');
const TransactionPool = require('../wallet/transaction-pool');
const Blockchain = require('../blockchain');
const P2PServer = require('../app/p2p-server');

class Miner {
  blockchain: Blockchain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  p2pServer: P2PServer;

  constructor(
    blockchain: Blockchain,
    transactionPool: TransactionPool,
    wallet: Wallet,
    p2pServer: P2PServer
  ) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    // create a block consisting of valid transactions
    const block = this.blockchain.addBlock(validTransactions);

    // sync chains in the p2p server
    this.p2pServer.syncChains();

    // clear the transaction pool
    this.transactionPool.clear();

    // broadcast to clear trnasactions pools
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;