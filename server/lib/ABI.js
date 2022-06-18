const bancorTokenContractABI = [
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "type": "function"
  },
]

const bancorNetworkInfoABI = [
  {
    "inputs": [
      {
        "internalType": "contract Token",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolTokenAmount",
        "type": "uint256"
      }
    ],
    "name": "poolTokenToUnderlying",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
]

module.exports = {
  bancorTokenContractABI,
  bancorNetworkInfoABI,
}
