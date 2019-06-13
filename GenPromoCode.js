const Web3 = require('web3');
const {bufferToHex} = require('ethereumjs-util');
const HDWalletProvider = require('truffle-hdwallet-provider');
const TokenABI = require('./abi/ERC20');
const PromoCodeABI = require('./abi/PromoCode');

const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
  new HDWalletProvider(mnemonic, rpcEndpoint);

const infuraProvider = network => providerWithMnemonic(
  process.env.MNEMONIC || '',
  `https://${network}.infura.io/v3/96bfc78effaa4a32bf99ce0dd4453132`,
);

const network = process.env.NETWORK || 'rinkeby';
const provider = infuraProvider(network);
let w3 = new Web3(provider);
const amount = new w3.utils.BN('88000000000000000000');
const numberOfCode = 300;
const approveAmount = amount.mul(new w3.utils.BN(numberOfCode + 100));
let promocodeAddress = '';
if (network === 'mainnet') {
  promocodeAddress = '0xaacf5eca66aecc1ef36e7283b665aa9aac59a10f';
} else {
  promocodeAddress = '0xf7e1c58873b97961c8e58c261f66499c50b34f1b';
}
const tokenContractAddress = '0xd42debE4eDc92Bd5a3FBb4243e1ecCf6d63A4A5d';

let i = 1;
let code = '';
let signature = '';
let privateKey = bufferToHex(provider.wallet._privKey);
console.log('#QRcodes');
for (i; i <= numberOfCode; i++) {
  code = 'C8190613' + i.toFixed(0).padStart(3, '0');
  let sign = w3.eth.accounts.sign(w3.utils.soliditySha3(promocodeAddress, code), privateKey);
  signature = sign.signature;
  let link = `URL:https://carboneum.io/p/?c=${code}&s=${signature}`;
  console.log(link);
}

let approve = network === 'rinkeby';
if (approve) {
  console.error(provider.address);
  console.error('Approving contract spending...');
  const token = new w3.eth.Contract(TokenABI, tokenContractAddress);
  token.methods.approve(promocodeAddress, w3.utils.toHex(approveAmount)).send(
    {from: provider.address, gas: 300000}).on('transactionHash', (hash) => {
    console.error('Approving Tx:', hash);
  }).on('confirmation', (confirmationNumber, receipt) => {
    console.error('confirmation1');
  }).on('receipt', (receipt) => {
    console.error('receipt1');
  }).on('error', console.error);
}
