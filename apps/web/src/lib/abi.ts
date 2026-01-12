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
  {
    "inputs": [],
    "name": "mintManagerFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_performanceFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_managerFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_entryFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_exitFeeNumerator", "type": "uint256" }
    ],
    "name": "announceFeeIncrease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commitFeeIncrease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "announcedFeeIncreaseTimestamp",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "announcedPerformanceFeeNumerator",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "announcedManagerFeeNumerator",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "announcedEntryFeeNumerator",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "announcedExitFeeNumerator",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
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

export const poolFactoryAbi = [
  {
    "inputs": [
      { "internalType": "bool", "name": "_privatePool", "type": "bool" },
      { "internalType": "address", "name": "_manager", "type": "address" },
      { "internalType": "string", "name": "_managerName", "type": "string" },
      { "internalType": "string", "name": "_fundName", "type": "string" },
      { "internalType": "string", "name": "_fundSymbol", "type": "string" },
      { "internalType": "uint256", "name": "_performanceFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_managerFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_entryFeeNumerator", "type": "uint256" },
      { "internalType": "uint256", "name": "_exitFeeNumerator", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "asset", "type": "address" },
          { "internalType": "bool", "name": "isDeposit", "type": "bool" }
        ],
        "internalType": "struct IHasSupportedAsset.Asset[]",
        "name": "_supportedAssets",
        "type": "tuple[]"
      }
    ],
    "name": "createFund",
    "outputs": [{ "internalType": "address", "name": "fund", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
