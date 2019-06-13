const express = require('express');
const Web3 = require('web3');
const {bufferToHex} = require('ethereumjs-util');
const HDWalletProvider = require('truffle-hdwallet-provider');
const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
  new HDWalletProvider(mnemonic, rpcEndpoint);
const infuraProvider = network => providerWithMnemonic(
  process.env.MNEMONIC || '',
  process.env.RPC_URL || `https://${network}.infura.io/${process.env.INFURA_API_KEY}`,
);

const router = express.Router();

function keccak256(...args) {
  args = args.map(arg => {
    if (typeof arg === 'string') {
      if (arg.substring(0, 2) === '0x') {
        return arg.slice(2);
      } else {
        return web3.toHex(arg).slice(2);
      }
    }

    if (typeof arg === 'number') {
      return (arg).toString(16).padStart(64, '0');
    } else {
      return '';
    }
  });

  args = args.join('');

  return w3.sha3(args, {encoding: 'hex'});
}

router.post('/', async (req, res, next) => {
  try {
    const user = req.body;
    const provider = infuraProvider(user.network);
    let w3 = new Web3(provider);
    let contractAddress = '';
    if (user.network === 'mainnet') {
      contractAddress = '0xaacf5eca66aecc1ef36e7283b665aa9aac59a10f';
    } else if (user.network === 'rinkeby') {
      contractAddress = '0xf7e1c58873b97961c8e58c261f66499c50b34f1b';
    }
    let issuer = w3.eth.accounts.recover(
      w3.utils.soliditySha3(contractAddress, user.code),
      user.signature
    ).toLowerCase();
    if (issuer !== provider.address) {
      res.status(400);
      return res.send({'status': 'error', 'message': 'Invalid code or signature'});
    }
    let privateKey = bufferToHex(provider.wallet._privKey);
    let hash = w3.utils.soliditySha3(contractAddress, user.address, user.code);
    let redeemSignature = w3.eth.accounts.sign(hash, privateKey);
    let result = {
      'status': 'ok',
      'redeemer': user.address,
      'code': user.code,
      'redeemSignature': redeemSignature.signature,
    };
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500);
    return res.send({'status': 'no', 'message': e.message});
  }
});

module.exports = router;
