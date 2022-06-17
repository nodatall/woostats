const web3 = require('../lib/web3')

const tokenContractABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_disable", "type": "bool" }],
    "name": "disableTransfers",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "version",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "standard",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_token", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "withdrawTokens",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "issue",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "destroy",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "transfersEnabled",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "newOwner",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "", "type": "address" },
      { "name": "", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_name", "type": "string" },
      { "name": "_symbol", "type": "string" },
      { "name": "_decimals", "type": "uint8" }
    ],
    "payable": false,
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "_token", "type": "address" }],
    "name": "NewSmartToken",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "_amount", "type": "uint256" }],
    "name": "Issuance",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "_amount", "type": "uint256" }],
    "name": "Destruction",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "name": "_prevOwner", "type": "address" },
      { "indexed": false, "name": "_newOwner", "type": "address" }
    ],
    "name": "OwnerUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "_from", "type": "address" },
      { "indexed": true, "name": "_to", "type": "address" },
      { "indexed": false, "name": "_value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "_owner", "type": "address" },
      { "indexed": true, "name": "_spender", "type": "address" },
      { "indexed": false, "name": "_value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  }
]

module.exports = async function fetchWooDaoBancorV3Balance({ tokenTickers }) {
  const wooDaoEthAddress = '0xfA2d1f15557170F6c4A4C5249e77f534184cdb79' // TODO put this in a constant
  const wooBancorContractAddress = '0x2FC8bC3eE171eD5610ba3093909421E90b47Fc07'
  const contract = new web3.eth.Contract(tokenContractABI, wooBancorContractAddress)
  const weiWooBalance = await contract.methods.balanceOf(wooDaoEthAddress).call()
  const wooBalance = Number(web3.utils.fromWei(weiWooBalance)).toFixed()
  const value = wooBalance * +tokenTickers.WOO.price

  return {
    "name": "Bancor V3",
    "chain": "eth",
    "value": value,
    "details": [
      {
        "type": "Liquidity Pool",
        "netValue": value,
        "supplied": [
          {
            "value": value,
            "amount": wooBalance,
            "symbol": "WOO",
            "logoUrl": "https://static.debank.com/image/eth_token/logo_url/0x4691937a7508860f876c9c0a2a617e7d9e945d4b/c68741e50aeee41d87b4f0cf50df859d.png"
          }
        ]
      }
    ],
    "logoUrl": "https://static.debank.com/image/project/logo_url/bancor/18b73b302f4d3122ac47534da9ead2ba.png",
    "rewards": [],
    "siteUrl": "https://app.bancor.network"
  }
}
