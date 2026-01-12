export const poolLogicAbi = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_fundTokenAmount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_asset", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [{ "internalType": "uint256", "name": "liquidityMinted", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolManagerLogic",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

export const poolManagerLogicAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "_newTrader", "type": "address" }],
    "name": "setTrader",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

export const erc20Abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;
