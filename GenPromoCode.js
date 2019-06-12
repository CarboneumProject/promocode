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
const approveAmount = amount.mul(new w3.utils.BN(numberOfCode));
let promocodeAddress = '';
if (network === 'mainnet') {
  promocodeAddress = '0xb2d34eccf8ea3a79705d7b0b41c47c5351b48779';
} else {
  promocodeAddress = '0x5807d311d872e81709de391a8ad13f9e16c5443b';
}
const tokenContractAddress = '0xd42debE4eDc92Bd5a3FBb4243e1ecCf6d63A4A5d';

let i = 1;
let code = '';
let signature = '';
let privateKey = bufferToHex(provider.wallet._privKey);
console.log('#QRcodes');
for (i; i <= numberOfCode + 1; i++) {
  code = 'C8190612' + i.toFixed(0).padStart(3, '0');
  let sign = w3.eth.accounts.sign(w3.utils.fromUtf8(code), privateKey);
  signature = sign.signature;
  if (i < numberOfCode) {
    let link = `URL:https://carboneum.io/p/?c=${code}&s=${signature}`;
    console.log(link);
  }
}

console.error(provider.address);
console.error('Approving contract spending...');
const token = new w3.eth.Contract(TokenABI, tokenContractAddress);
token.methods.approve(promocodeAddress, w3.utils.toHex(approveAmount)).send(
  {from: provider.address, gas: 300000}).on('transactionHash', (hash) => {
  console.error('Approving Tx:', hash);
  console.error('Testing Redeem Code...', code);
  const promoCode = new w3.eth.Contract(PromoCodeABI, promocodeAddress);
  promoCode.methods.redeem(code, signature).send(
    {from: provider.address, gas: 300000}).on('transactionHash', (redeemHash) => {
    console.error('Test Redeem Tx:', redeemHash);
    process.exit();
  }).on('confirmation', (confirmationNumber, receipt) => {
    console.error('confirmation2');
  }).on('receipt', (receipt) => {
  }).on('error', console.error);
}).on('confirmation', (confirmationNumber, receipt) => {
  console.error('confirmation1');
}).on('receipt', (receipt) => {
  console.error('receipt1');
}).on('error', console.error);
