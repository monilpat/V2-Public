"use strict";exports.id=1671,exports.ids=[1671],exports.modules={41671:(e,t,i)=>{i.r(t),i.d(t,{PayController:()=>ea,W3mPayLoadingView:()=>ev,W3mPayQuoteView:()=>eB,W3mPayView:()=>eo,arbitrumUSDC:()=>eJ,arbitrumUSDT:()=>e2,baseETH:()=>eY,baseSepoliaETH:()=>eK,baseUSDC:()=>eV,ethereumUSDC:()=>eH,ethereumUSDT:()=>e1,getExchanges:()=>eM,getIsPaymentInProgress:()=>eW,getPayError:()=>eG,getPayResult:()=>ez,openPay:()=>ej,optimismUSDC:()=>eX,optimismUSDT:()=>e3,pay:()=>eF,polygonUSDC:()=>eZ,polygonUSDT:()=>e5,solanaSOL:()=>e6,solanaUSDC:()=>e0,solanaUSDT:()=>e4});var n=i(32119),a=i(89669),r=i(73540),s=i(64434),o=i(38350),c=i(82951),l=i(22523),u=i(3922),d=i(43411),p=i(51334),m=i(88564);i(19234),i(3045),i(83305),i(87969),i(44314),i(69537),i(37541),i(6766),i(42779),i(76676),i(31745),i(41756);var h=i(33278),g=i(15346),y=i(2031),w=i(51223),f=i(40692),b=i(29330),x=i(29994),v=i(37652),E=i(20174);let A={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS",UNABLE_TO_GET_TOKEN_BALANCES:"UNABLE_TO_GET_TOKEN_BALANCES",UNABLE_TO_GET_QUOTE:"UNABLE_TO_GET_QUOTE",UNABLE_TO_GET_QUOTE_STATUS:"UNABLE_TO_GET_QUOTE_STATUS",INVALID_RECIPIENT_ADDRESS_FOR_ASSET:"INVALID_RECIPIENT_ADDRESS_FOR_ASSET"},C={[A.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[A.INVALID_RECIPIENT]:"Invalid recipient address",[A.INVALID_ASSET]:"Invalid asset specified",[A.INVALID_AMOUNT]:"Invalid payment amount",[A.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:"Invalid recipient address for the asset selected",[A.UNKNOWN_ERROR]:"Unknown payment error occurred",[A.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[A.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[A.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[A.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[A.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[A.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[A.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status",[A.UNABLE_TO_GET_TOKEN_BALANCES]:"Unable to get token balances",[A.UNABLE_TO_GET_QUOTE]:"Unable to get quote. Please choose a different token",[A.UNABLE_TO_GET_QUOTE_STATUS]:"Unable to get quote status"};class I extends Error{get message(){return C[this.code]}constructor(e,t){super(C[e]),this.name="AppKitPayError",this.code=e,this.details=t,Error.captureStackTrace&&Error.captureStackTrace(this,I)}}var S=i(64941),k=i(55800),N=i(14763);let T="reown_test";var P=i(79689),$=i(4925);async function _(e,t,i){if(t!==y.b.CHAIN.EVM)throw new I(A.INVALID_CHAIN_NAMESPACE);if(!i.fromAddress)throw new I(A.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");let n="string"==typeof i.amount?parseFloat(i.amount):i.amount;if(isNaN(n))throw new I(A.INVALID_PAYMENT_CONFIG);let a=e.metadata?.decimals??18,r=d.ConnectionController.parseUnits(n.toString(),a);if("bigint"!=typeof r)throw new I(A.GENERIC_PAYMENT_ERROR);return await d.ConnectionController.sendTransaction({chainNamespace:t,to:i.recipient,address:i.fromAddress,value:r,data:"0x"})??void 0}async function R(e,t){if(!t.fromAddress)throw new I(A.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");let i=e.asset,n=t.recipient,a=Number(e.metadata.decimals),r=d.ConnectionController.parseUnits(t.amount.toString(),a);if(void 0===r)throw new I(A.GENERIC_PAYMENT_ERROR);return await d.ConnectionController.writeContract({fromAddress:t.fromAddress,tokenAddress:i,args:[n,r],method:"transfer",abi:P.g.getERC20Abi(i),chainNamespace:y.b.CHAIN.EVM})??void 0}async function O(e,t){if(e!==y.b.CHAIN.SOLANA)throw new I(A.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new I(A.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");let i="string"==typeof t.amount?parseFloat(t.amount):t.amount;if(isNaN(i)||i<=0)throw new I(A.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!$.O.getProvider(e))throw new I(A.GENERIC_PAYMENT_ERROR,"No Solana provider available.");let n=await d.ConnectionController.sendTransaction({chainNamespace:y.b.CHAIN.SOLANA,to:t.recipient,value:i,tokenMint:t.tokenMint});if(!n)throw new I(A.GENERIC_PAYMENT_ERROR,"Transaction failed.");return n}catch(e){if(e instanceof I)throw e;throw new I(A.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}async function U({sourceToken:e,toToken:t,amount:i,recipient:n}){let a=d.ConnectionController.parseUnits(i,e.metadata.decimals),r=d.ConnectionController.parseUnits(i,t.metadata.decimals);return Promise.resolve({type:ee,origin:{amount:a?.toString()??"0",currency:e},destination:{amount:r?.toString()??"0",currency:t},fees:[{id:"service",label:"Service Fee",amount:"0",currency:t}],steps:[{requestId:ee,type:"deposit",deposit:{amount:a?.toString()??"0",currency:e.asset,receiver:n}}],timeInSeconds:6})}function D(e){if(!e)return null;let t=e.steps[0];return t&&t.type===et?t:null}function q(e,t=0){if(!e)return[];let i=e.steps.filter(e=>e.type===ei),n=i.filter((e,i)=>i+1>t);return i.length>0&&i.length<3?n:[]}let L=new S.V({baseUrl:x.j.getApiUrl(),clientId:null});class B extends Error{}function j(){let{projectId:e,sdkType:t,sdkVersion:i}=k.OptionsController.state;return{projectId:e,st:t||"appkit",sv:i||"html-wagmi-4.2.2"}}async function F(e,t){let i=function(){let e=k.OptionsController.getSnapshot().projectId;return`https://rpc.walletconnect.org/v1/json-rpc?projectId=${e}`}(),{sdkType:n,sdkVersion:a,projectId:r}=k.OptionsController.getSnapshot(),s={jsonrpc:"2.0",id:1,method:e,params:{...t||{},st:n,sv:a,projectId:r}},o=await fetch(i,{method:"POST",body:JSON.stringify(s),headers:{"Content-Type":"application/json"}}),c=await o.json();if(c.error)throw new B(c.error.message);return c}async function M(e){return(await F("reown_getExchanges",e)).result}async function z(e){return(await F("reown_getExchangePayUrl",e)).result}async function G(e){return(await F("reown_getExchangeBuyStatus",e)).result}async function W(e){let t=f.C.bigNumber(e.amount).times(10**e.toToken.metadata.decimals).toString(),{chainId:i,chainNamespace:n}=w.u.parseCaipNetworkId(e.sourceToken.network),{chainId:a,chainNamespace:r}=w.u.parseCaipNetworkId(e.toToken.network),s="native"===e.sourceToken.asset?(0,N.rG)(n):e.sourceToken.asset,o="native"===e.toToken.asset?(0,N.rG)(r):e.toToken.asset;return await L.post({path:"/appkit/v1/transfers/quote",body:{user:e.address,originChainId:i.toString(),originCurrency:s,destinationChainId:a.toString(),destinationCurrency:o,recipient:e.recipient,amount:t},params:j()})}async function Q(e){let t=E.g.isLowerCaseMatch(e.sourceToken.network,e.toToken.network),i=E.g.isLowerCaseMatch(e.sourceToken.asset,e.toToken.asset);return t&&i?U(e):W(e)}async function Y(e){return await L.get({path:"/appkit/v1/transfers/status",params:{requestId:e.requestId,...j()}})}async function V(e){return await L.get({path:`/appkit/v1/transfers/assets/exchanges/${e}`,params:j()})}let K=["eip155","solana"],H={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function X(e,t){let{chainNamespace:i,chainId:n}=w.u.parseCaipNetworkId(e),a=H[i];if(!a)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${i}`);let r=a.native.assetNamespace,s=a.native.assetReference;"native"!==t&&(r=a.defaultTokenNamespace,s=t);let o=`${i}:${n}`;return`${o}/${r}:${s}`}function J(e){let t=f.C.bigNumber(e,{safe:!0});return t.lt(.001)?"<0.001":t.round(4).toString()}let Z="unknown",ee="direct-transfer",et="deposit",ei="transaction",en=(0,h.sj)({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:"pay",tokenBalances:{[y.b.CHAIN.EVM]:[],[y.b.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:"waiting",quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),ea={state:en,subscribe:e=>(0,h.Ld)(en,()=>e(en)),subscribeKey:(e,t)=>(0,g.VW)(en,e,t),async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.initializeAnalytics(),function(){let{chainNamespace:e}=w.u.parseCaipNetworkId(ea.state.paymentAsset.network);if(!x.j.isAddress(ea.state.recipient,e))throw new I(A.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${e}"`)}(),await this.prepareTokenLogo(),en.isConfigured=!0,b.X.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:en.exchanges,configuration:{network:en.paymentAsset.network,asset:en.paymentAsset.asset,recipient:en.recipient,amount:en.amount}}}),await u.I.open({view:"Pay"})},resetState(){en.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},en.recipient="0x0",en.amount=0,en.isConfigured=!1,en.error=null,en.isPaymentInProgress=!1,en.isLoading=!1,en.currentPayment=void 0,en.selectedExchange=void 0,en.exchangeUrlForQuote=void 0,en.requestId=void 0},resetQuoteState(){en.quote=void 0,en.quoteStatus="waiting",en.quoteError=null,en.isFetchingQuote=!1,en.requestId=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new I(A.INVALID_PAYMENT_CONFIG);try{en.choice=e.choice??"pay",en.paymentAsset=e.paymentAsset,en.recipient=e.recipient,en.amount=e.amount,en.openInNewTab=e.openInNewTab??!0,en.redirectUrl=e.redirectUrl,en.payWithExchange=e.payWithExchange,en.error=null}catch(e){throw new I(A.INVALID_PAYMENT_CONFIG,e.message)}},setSelectedPaymentAsset(e){en.selectedPaymentAsset=e},setSelectedExchange(e){en.selectedExchange=e},setRequestId(e){en.requestId=e},setPaymentInProgress(e){en.isPaymentInProgress=e},getPaymentAsset:()=>en.paymentAsset,getExchanges:()=>en.exchanges,async fetchExchanges(){try{en.isLoading=!0;let e=await M({page:0});en.exchanges=e.exchanges.slice(0,2)}catch(e){throw p.SnackController.showError(C.UNABLE_TO_GET_EXCHANGES),new I(A.UNABLE_TO_GET_EXCHANGES)}finally{en.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?X(e.network,e.asset):void 0;return await M({page:e?.page??0,asset:t,amount:e?.amount?.toString()})}catch(e){throw new I(A.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,i=!1){try{let n=Number(t.amount),a=await z({exchangeId:e,asset:X(t.network,t.asset),amount:n.toString(),recipient:`${t.network}:${t.recipient}`});return b.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:n},currentPayment:{type:"exchange",exchangeId:e},headless:i}}),i&&(this.initiatePayment(),b.X.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:en.paymentId||Z,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:n},currentPayment:{type:"exchange",exchangeId:e}}})),a}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw new I(A.ASSET_NOT_SUPPORTED);throw Error(e.message)}},async generateExchangeUrlForQuote({exchangeId:e,paymentAsset:t,amount:i,recipient:n}){let a=await z({exchangeId:e,asset:X(t.network,t.asset),amount:i.toString(),recipient:n});en.exchangeSessionId=a.sessionId,en.exchangeUrlForQuote=a.url},async openPayUrl(e,t,i=!1){try{let n=await this.getPayUrl(e.exchangeId,t,i);if(!n)throw new I(A.UNABLE_TO_GET_PAY_URL);let a=e.openInNewTab??!0;return x.j.openHref(n.url,a?"_blank":"_self"),n}catch(e){throw e instanceof I?en.error=e.message:en.error=C.GENERIC_PAYMENT_ERROR,new I(A.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:e,fromAddress:t,toAddress:i,amount:n,paymentAsset:a}){if(en.currentPayment={type:"wallet",status:"IN_PROGRESS"},!en.isPaymentInProgress)try{this.initiatePayment();let r=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===a.network);if(!r)throw Error("Target network not found");let s=o.R.state.activeCaipNetwork;switch(E.g.isLowerCaseMatch(s?.caipNetworkId,r.caipNetworkId)||await o.R.switchActiveNetwork(r),e){case y.b.CHAIN.EVM:"native"===a.asset&&(en.currentPayment.result=await _(a,e,{recipient:i,amount:n,fromAddress:t})),a.asset.startsWith("0x")&&(en.currentPayment.result=await R(a,{recipient:i,amount:n,fromAddress:t})),en.currentPayment.status="SUCCESS";break;case y.b.CHAIN.SOLANA:en.currentPayment.result=await O(e,{recipient:i,amount:n,fromAddress:t,tokenMint:"native"===a.asset?void 0:a.asset}),en.currentPayment.status="SUCCESS";break;default:throw new I(A.INVALID_CHAIN_NAMESPACE)}}catch(e){throw e instanceof I?en.error=e.message:en.error=C.GENERIC_PAYMENT_ERROR,en.currentPayment.status="FAILED",p.SnackController.showError(en.error),e}finally{en.isPaymentInProgress=!1}},async onSendTransaction(e){try{let{namespace:t,transactionStep:i}=e;ea.initiatePayment();let n=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===en.paymentAsset?.network);if(!n)throw Error("Target network not found");let a=o.R.state.activeCaipNetwork;if(E.g.isLowerCaseMatch(a?.caipNetworkId,n.caipNetworkId)||await o.R.switchActiveNetwork(n),t===y.b.CHAIN.EVM){let{from:e,to:n,data:a,value:r}=i.transaction;await d.ConnectionController.sendTransaction({address:e,to:n,data:a,value:BigInt(r),chainNamespace:t})}else if(t===y.b.CHAIN.SOLANA){let{instructions:e}=i.transaction;await d.ConnectionController.writeSolanaTransaction({instructions:e})}}catch(e){throw e instanceof I?en.error=e.message:en.error=C.GENERIC_PAYMENT_ERROR,p.SnackController.showError(en.error),e}finally{en.isPaymentInProgress=!1}},getExchangeById:e=>en.exchanges.find(t=>t.id===e),validatePayConfig(e){let{paymentAsset:t,recipient:i,amount:n}=e;if(!t)throw new I(A.INVALID_PAYMENT_CONFIG);if(!i)throw new I(A.INVALID_RECIPIENT);if(!t.asset)throw new I(A.INVALID_ASSET);if(null==n||n<=0)throw new I(A.INVALID_AMOUNT)},async handlePayWithExchange(e){try{en.currentPayment={type:"exchange",exchangeId:e};let{network:t,asset:i}=en.paymentAsset,n={network:t,asset:i,amount:en.amount,recipient:en.recipient},a=await this.getPayUrl(e,n);if(!a)throw new I(A.UNABLE_TO_INITIATE_PAYMENT);return en.currentPayment.sessionId=a.sessionId,en.currentPayment.status="IN_PROGRESS",en.currentPayment.exchangeId=e,this.initiatePayment(),{url:a.url,openInNewTab:en.openInNewTab}}catch(e){return e instanceof I?en.error=e.message:en.error=C.GENERIC_PAYMENT_ERROR,en.isPaymentInProgress=!1,p.SnackController.showError(en.error),null}},async getBuyStatus(e,t){try{let i=await G({sessionId:t,exchangeId:e});return("SUCCESS"===i.status||"FAILED"===i.status)&&b.X.sendEvent({type:"track",event:"SUCCESS"===i.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===i.status?x.j.parseError(en.error):void 0,source:"pay",paymentId:en.paymentId||Z,configuration:{network:en.paymentAsset.network,asset:en.paymentAsset.asset,recipient:en.recipient,amount:en.amount},currentPayment:{type:"exchange",exchangeId:en.currentPayment?.exchangeId,sessionId:en.currentPayment?.sessionId,result:i.txHash}}}),i}catch(e){throw new I(A.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:i}){if(!e)return[];let{address:n}=w.u.parseCaipAddress(e),a=t;return i===y.b.CHAIN.EVM&&(a=void 0),await v.Q.getMyTokensWithBalance({address:n,caipNetwork:a})},async fetchTokensFromExchange(){if(!en.selectedExchange)return[];let e=Object.values((await V(en.selectedExchange.id)).assets).flat();return await Promise.all(e.map(async e=>{let t={chainId:e.network,address:`${e.network}:${e.asset}`,symbol:e.metadata.symbol,name:e.metadata.name,iconUrl:e.metadata.logoURI||"",price:0,quantity:{numeric:"0",decimals:e.metadata.decimals.toString()}},{chainNamespace:i}=w.u.parseCaipNetworkId(t.chainId),n=t.address;if(x.j.isCaipAddress(n)){let{address:e}=w.u.parseCaipAddress(n);n=e}let a=await c.f.getImageByToken(n??"",i).catch(()=>void 0);return t.iconUrl=a??"",t}))},async fetchTokens({caipAddress:e,caipNetwork:t,namespace:i}){try{en.isFetchingTokenBalances=!0;let n=en.selectedExchange?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:i}),a=await n;en.tokenBalances={...en.tokenBalances,[i]:a}}catch(t){let e=t instanceof Error?t.message:"Unable to get token balances";p.SnackController.showError(e)}finally{en.isFetchingTokenBalances=!1}},async fetchQuote({amount:e,address:t,sourceToken:i,toToken:n,recipient:a}){try{ea.resetQuoteState(),en.isFetchingQuote=!0;let r=await Q({amount:e,address:en.selectedExchange?void 0:t,sourceToken:i,toToken:n,recipient:a});if(en.selectedExchange){let e=D(r);if(e){let t=`${i.network}:${e.deposit.receiver}`,n=f.C.formatNumber(e.deposit.amount,{decimals:i.metadata.decimals??0,round:8});await ea.generateExchangeUrlForQuote({exchangeId:en.selectedExchange.id,paymentAsset:i,amount:n.toString(),recipient:t})}}en.quote=r}catch(t){let e=C.UNABLE_TO_GET_QUOTE;if(t instanceof Error&&t.cause&&t.cause instanceof Response)try{let i=await t.cause.json();i.error&&"string"==typeof i.error&&(e=i.error)}catch{}throw en.quoteError=e,p.SnackController.showError(e),new I(A.UNABLE_TO_GET_QUOTE)}finally{en.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:e}){try{if(e===ee){let e=en.selectedExchange,t=en.exchangeSessionId;if(e&&t){switch((await this.getBuyStatus(e.id,t)).status){case"IN_PROGRESS":case"UNKNOWN":default:en.quoteStatus="waiting";break;case"SUCCESS":en.quoteStatus="success",en.isPaymentInProgress=!1;break;case"FAILED":en.quoteStatus="failure",en.isPaymentInProgress=!1}return}en.quoteStatus="success";return}let{status:t}=await Y({requestId:e});en.quoteStatus=t}catch{throw en.quoteStatus="failure",new I(A.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){en.isPaymentInProgress=!0,en.paymentId=crypto.randomUUID()},initializeAnalytics(){en.analyticsSet||(en.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",e=>{if(en.currentPayment?.status&&"UNKNOWN"!==en.currentPayment.status){let e={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[en.currentPayment.status];b.X.sendEvent({type:"track",event:e,properties:{message:"FAILED"===en.currentPayment.status?x.j.parseError(en.error):void 0,source:"pay",paymentId:en.paymentId||Z,configuration:{network:en.paymentAsset.network,asset:en.paymentAsset.asset,recipient:en.recipient,amount:en.amount},currentPayment:{type:en.currentPayment.type,exchangeId:en.currentPayment.exchangeId,sessionId:en.currentPayment.sessionId,result:en.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!en.paymentAsset.metadata.logoURI)try{let{chainNamespace:e}=w.u.parseCaipNetworkId(en.paymentAsset.network),t=await c.f.getImageByToken(en.paymentAsset.asset,e);en.paymentAsset.metadata.logoURI=t}catch{}}},er=(0,m.iv)`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[8]};
    border-top-left-radius: ${({borderRadius:e})=>e[8]};
  }
`;var es=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eo=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.amount=ea.state.amount,this.namespace=void 0,this.paymentAsset=ea.state.paymentAsset,this.activeConnectorIds=s.ConnectorController.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=ea.state.exchanges,this.isLoading=ea.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(ea.subscribeKey("amount",e=>this.amount=e)),this.unsubscribe.push(s.ConnectorController.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e)),this.unsubscribe.push(ea.subscribeKey("exchanges",e=>this.exchanges=e)),this.unsubscribe.push(ea.subscribeKey("isLoading",e=>this.isLoading=e)),ea.fetchExchanges(),ea.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,n.dy)`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return(0,n.dy)`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){let e=o.R.state.activeChain;this.namespace=e,this.caipAddress=o.R.getAccountData(e)?.caipAddress,this.unsubscribe.push(o.R.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress},e))}paymentDetailsTemplate(){let e=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return(0,n.dy)`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${["6","8","6","8"]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${J(this.amount||"0")}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||"Unknown"}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${e?.name||"Unknown"}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${(0,r.o)(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${(0,r.o)(c.f.getNetworkImage(e))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return!function(e){let{chainNamespace:t}=w.u.parseCaipNetworkId(e);return K.includes(t)}(this.paymentAsset.network)?(0,n.dy)``:this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate()}connectedWalletTemplate(){let{name:e,image:t}=this.getWalletProperties({namespace:this.namespace});return(0,n.dy)`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${(0,r.o)(t)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return(0,n.dy)`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return(0,n.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;let e=this.exchanges.filter(e=>!function(e){let t=o.R.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.network);return!!t&&!!t.testnet}(this.paymentAsset)?e.id!==T:e.id===T);return 0===e.length?(0,n.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:e.map(e=>(0,n.dy)`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(e)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          imageSrc=${(0,r.o)(e.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${e.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return(0,n.dy)`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw Error("Namespace not found");this.caipAddress?l.RouterController.push("PayQuote"):(await s.ConnectorController.connect(),await u.I.open({view:"PayQuote"}))}onExchangePayment(e){ea.setSelectedExchange(e),l.RouterController.push("PayQuote")}async onDisconnect(){try{await d.ConnectionController.disconnect(),await u.I.open({view:"Pay"})}catch{console.error("Failed to disconnect"),p.SnackController.showError("Failed to disconnect")}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let i=s.ConnectorController.getConnector({id:t,namespace:e});if(!i)return{name:void 0,image:void 0};let n=c.f.getConnectorImage(i);return{name:i.name,image:n}}};eo.styles=er,es([(0,a.SB)()],eo.prototype,"amount",void 0),es([(0,a.SB)()],eo.prototype,"namespace",void 0),es([(0,a.SB)()],eo.prototype,"paymentAsset",void 0),es([(0,a.SB)()],eo.prototype,"activeConnectorIds",void 0),es([(0,a.SB)()],eo.prototype,"caipAddress",void 0),es([(0,a.SB)()],eo.prototype,"exchanges",void 0),es([(0,a.SB)()],eo.prototype,"isLoading",void 0),eo=es([(0,m.Mo)("w3m-pay-view")],eo);var ec=i(54646),el=i(20679),eu=i(19501),ed=i(41492);let ep=(0,el.iv)`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;var em=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eh={"accent-primary":el.gR.tokens.core.backgroundAccentPrimary},eg=class extends n.oi{constructor(){super(...arguments),this.rings=3,this.duration=2,this.opacity=.3,this.size="200px",this.variant="accent-primary"}render(){let e=eh[this.variant];this.style.cssText=`
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${e};
      --pulse-opacity: ${this.opacity};
    `;let t=Array.from({length:this.rings},(e,t)=>this.renderRing(t,this.rings));return(0,n.dy)`
      <div class="pulse-container">
        <div class="pulse-rings">${t}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,t){let i=e/t*this.duration,a=`animation-delay: ${i}s;`;return(0,n.dy)`<div class="pulse-ring" style=${a}></div>`}};eg.styles=[eu.ET,ep],em([(0,a.Cb)({type:Number})],eg.prototype,"rings",void 0),em([(0,a.Cb)({type:Number})],eg.prototype,"duration",void 0),em([(0,a.Cb)({type:Number})],eg.prototype,"opacity",void 0),em([(0,a.Cb)()],eg.prototype,"size",void 0),em([(0,a.Cb)()],eg.prototype,"variant",void 0),eg=em([(0,ed.M)("wui-pulse")],eg);let ey=[{id:"received",title:"Receiving funds",icon:"dollar"},{id:"processing",title:"Swapping asset",icon:"recycleHorizontal"},{id:"sending",title:"Sending asset to the recipient address",icon:"send"}],ew=["success","submitted","failure","timeout","refund"],ef=(0,m.iv)`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:e})=>e[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:e})=>e.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[6]};
    border-top-left-radius: ${({borderRadius:e})=>e[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e.round};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }
`;var eb=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let ex={received:["pending","success","submitted"],processing:["success","submitted"],sending:["success","submitted"]},ev=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=ea.state.paymentAsset,this.quoteStatus=ea.state.quoteStatus,this.quote=ea.state.quote,this.amount=ea.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=s.ConnectorController.state.activeConnectorIds,this.selectedExchange=ea.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(ea.subscribeKey("quoteStatus",e=>this.quoteStatus=e),ea.subscribeKey("quote",e=>this.quote=e),s.ConnectorController.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e),ea.subscribeKey("selectedExchange",e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return(0,n.dy)`
      <wui-flex flexDirection="column" .padding=${["3","0","0","0"]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){let e=J(this.amount||"0"),t=this.paymentAsset.metadata.symbol??"Unknown",i=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network),a="failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus;return"success"===this.quoteStatus||"submitted"===this.quoteStatus?(0,n.dy)`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:a?(0,n.dy)`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:(0,n.dy)`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${(0,r.o)(c.f.getNetworkImage(i))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${e} ${t}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return(0,n.dy)`
      <wui-flex flexDirection="column" gap="2" .padding=${["0","6","0","6"]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){let e=this.getStepsWithStatus();return(0,n.dy)`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${["2","0","2","0"]}>
          ${e.map(e=>this.renderStep(e))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){let e="failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus,t="success"===this.quoteStatus||"submitted"===this.quoteStatus;if(e)return(0,n.dy)`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(t)return(0,n.dy)`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;let i=this.quote?.timeInSeconds??0;return(0,n.dy)`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${i} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){let e=o.R.getAllRequestedCaipNetworks().find(e=>{let t=this.quote?.origin.currency.network;if(!t)return!1;let{chainId:i}=w.u.parseCaipNetworkId(t);return E.g.isLowerCaseMatch(e.id.toString(),i.toString())}),t=J(f.C.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString()),i=this.quote?.origin.currency.metadata.symbol??"Unknown";return(0,n.dy)`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${t}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${i}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${(0,r.o)(c.f.getNetworkImage(e))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${e?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return(0,n.dy)`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary">Wallet</wui-text>

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){let{image:e}=this.getWalletProperties({namespace:this.namespace}),{address:t}=this.caipAddress?w.u.parseCaipAddress(this.caipAddress):{},i=this.selectedExchange?.name;return this.selectedExchange?(0,n.dy)`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${i}</wui-text>
          <wui-image src=${(0,r.o)(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:(0,n.dy)`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${m.Hg.getTruncateString({string:this.profileName||t||i||"",charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?"end":"middle"})}
        </wui-text>

        <wui-image src=${(0,r.o)(e)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return"failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus?ey.map(e=>({...e,status:"failed"})):ey.map(e=>{let t=(ex[e.id]??[]).includes(this.quoteStatus)?"completed":"pending";return{...e,status:t}})}renderStep({title:e,icon:t,status:i}){return(0,n.dy)`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${t} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${(0,ec.$)({"step-icon-box":!0,success:"completed"===i})}>
            ${this.renderStatusIndicator(i)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${e}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(e){return"completed"===e?(0,n.dy)`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:"failed"===e?(0,n.dy)`<wui-icon size="sm" color="error" name="close"></wui-icon>`:"pending"===e?(0,n.dy)`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||(this.fetchQuoteStatus(),this.pollingInterval=setInterval(()=>{this.fetchQuoteStatus()},3e3))}stopPolling(){this.pollingInterval&&(clearInterval(this.pollingInterval),this.pollingInterval=null)}async fetchQuoteStatus(){let e=ea.state.requestId;if(!e||ew.includes(this.quoteStatus))this.stopPolling();else try{await ea.fetchQuoteStatus({requestId:e}),ew.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){let e=o.R.state.activeChain;this.namespace=e,this.caipAddress=o.R.getAccountData(e)?.caipAddress,this.profileName=o.R.getAccountData(e)?.profileName??null,this.unsubscribe.push(o.R.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let i=s.ConnectorController.getConnector({id:t,namespace:e});if(!i)return{name:void 0,image:void 0};let n=c.f.getConnectorImage(i);return{name:i.name,image:n}}};ev.styles=ef,eb([(0,a.SB)()],ev.prototype,"paymentAsset",void 0),eb([(0,a.SB)()],ev.prototype,"quoteStatus",void 0),eb([(0,a.SB)()],ev.prototype,"quote",void 0),eb([(0,a.SB)()],ev.prototype,"amount",void 0),eb([(0,a.SB)()],ev.prototype,"namespace",void 0),eb([(0,a.SB)()],ev.prototype,"caipAddress",void 0),eb([(0,a.SB)()],ev.prototype,"profileName",void 0),eb([(0,a.SB)()],ev.prototype,"activeConnectorIds",void 0),eb([(0,a.SB)()],ev.prototype,"selectedExchange",void 0),ev=eb([(0,m.Mo)("w3m-pay-loading-view")],ev),i(5071),i(99360);let eE=(0,n.iv)`
  :host {
    display: block;
  }
`,eA=class extends n.oi{render(){return(0,n.dy)`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};eA.styles=[eE],eA=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,m.Mo)("w3m-pay-fees-skeleton")],eA);let eC=(0,m.iv)`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }
`;var eI=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eS=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.quote=ea.state.quote,this.unsubscribe.push(ea.subscribeKey("quote",e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=f.C.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return(0,n.dy)`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${e} ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(e=>this.renderFee(e)):null}
      </wui-flex>
    `}renderFee(e){let t="network"===e.id,i=f.C.formatNumber(e.amount||"0",{decimals:e.currency.metadata.decimals??0,round:6}).toString();if(t){let t=o.R.getAllRequestedCaipNetworks().find(t=>E.g.isLowerCaseMatch(t.caipNetworkId,e.currency.network));return(0,n.dy)`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${i} ${e.currency.metadata.symbol||"Unknown"}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${(0,r.o)(c.f.getNetworkImage(t))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${t?.name||"Unknown"}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return(0,n.dy)`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${i} ${e.currency.metadata.symbol||"Unknown"}
        </wui-text>
      </wui-flex>
    `}};eS.styles=[eC],eI([(0,a.SB)()],eS.prototype,"quote",void 0),eS=eI([(0,m.Mo)("w3m-pay-fees")],eS);let ek=(0,m.iv)`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:e})=>e[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:e})=>e[8]};
    height: ${({spacing:e})=>e[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`;var eN=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eT=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.selectedExchange=ea.state.selectedExchange,this.unsubscribe.push(ea.subscribeKey("selectedExchange",e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!!this.selectedExchange;return(0,n.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${e?null:(0,n.dy)`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent("connectOtherWallet",{detail:!0,bubbles:!0,composed:!0}))}};eT.styles=[ek],eN([(0,a.Cb)({type:Array})],eT.prototype,"selectedExchange",void 0),eT=eN([(0,m.Mo)("w3m-pay-options-empty")],eT);let eP=(0,m.iv)`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:e})=>e.theme.foregroundSecondary};
  }
`,e$=class extends n.oi{render(){return(0,n.dy)`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return(0,n.dy)`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};e$.styles=[eP],e$=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}([(0,m.Mo)("w3m-pay-options-skeleton")],e$);let e_=(0,m.iv)`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`;var eR=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eO=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect();let e=this.shadowRoot?.querySelector(".pay-options-container");e?.removeEventListener("scroll",this.handleOptionsListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(".pay-options-container");e&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),e?.addEventListener("scroll",this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(e),this.handleOptionsListScroll())}render(){return(0,n.dy)`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(e=>this.payOptionTemplate(e))}
      </wui-flex>
    `}payOptionTemplate(e){let{network:t,metadata:i,asset:a,amount:s="0"}=e,l=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===t),u=`${t}:${a}`,d=`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,p=f.C.bigNumber(s,{safe:!0}),m=p.gt(0);return(0,n.dy)`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${(0,r.o)(i.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${(0,r.o)(c.f.getNetworkImage(l))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${i.symbol}</wui-text>
            ${m?(0,n.dy)`<wui-text variant="sm-regular" color="secondary">
                  ${p.round(6).toString()} ${i.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${u===d?(0,n.dy)`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){let e=this.shadowRoot?.querySelector(".pay-options-container");e&&(e.scrollHeight>300?(e.style.setProperty("--options-mask-image",`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty("--options-scroll--top-opacity",m.kj.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty("--options-scroll--bottom-opacity",m.kj.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty("--options-mask-image","none"),e.style.setProperty("--options-scroll--top-opacity","0"),e.style.setProperty("--options-scroll--bottom-opacity","0")))}};eO.styles=[e_],eR([(0,a.Cb)({type:Array})],eO.prototype,"options",void 0),eR([(0,a.Cb)()],eO.prototype,"selectedPaymentAsset",void 0),eR([(0,a.Cb)()],eO.prototype,"onSelect",void 0),eO=eR([(0,m.Mo)("w3m-pay-options")],eO);let eU=(0,m.iv)`
  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[5]};
    border-top-left-radius: ${({borderRadius:e})=>e[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding: ${({spacing:e})=>e[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;var eD=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let eq={eip155:"ethereum",solana:"solana",bip122:"bitcoin",ton:"ton"},eL={eip155:{icon:eq.eip155,label:"EVM"},solana:{icon:eq.solana,label:"Solana"},bip122:{icon:eq.bip122,label:"Bitcoin"},ton:{icon:eq.ton,label:"Ton"}},eB=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=ea.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=ea.state.amount,this.recipient=ea.state.recipient,this.activeConnectorIds=s.ConnectorController.state.activeConnectorIds,this.selectedPaymentAsset=ea.state.selectedPaymentAsset,this.selectedExchange=ea.state.selectedExchange,this.isFetchingQuote=ea.state.isFetchingQuote,this.quoteError=ea.state.quoteError,this.quote=ea.state.quote,this.isFetchingTokenBalances=ea.state.isFetchingTokenBalances,this.tokenBalances=ea.state.tokenBalances,this.isPaymentInProgress=ea.state.isPaymentInProgress,this.exchangeUrlForQuote=ea.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(ea.subscribeKey("paymentAsset",e=>this.paymentAsset=e)),this.unsubscribe.push(ea.subscribeKey("tokenBalances",e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(ea.subscribeKey("isFetchingTokenBalances",e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(s.ConnectorController.subscribeKey("activeConnectorIds",e=>this.activeConnectorIds=e)),this.unsubscribe.push(ea.subscribeKey("selectedPaymentAsset",e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(ea.subscribeKey("isFetchingQuote",e=>this.isFetchingQuote=e)),this.unsubscribe.push(ea.subscribeKey("quoteError",e=>this.quoteError=e)),this.unsubscribe.push(ea.subscribeKey("quote",e=>this.quote=e)),this.unsubscribe.push(ea.subscribeKey("amount",e=>this.amount=e)),this.unsubscribe.push(ea.subscribeKey("recipient",e=>this.recipient=e)),this.unsubscribe.push(ea.subscribeKey("isPaymentInProgress",e=>this.isPaymentInProgress=e)),this.unsubscribe.push(ea.subscribeKey("selectedExchange",e=>this.selectedExchange=e)),this.unsubscribe.push(ea.subscribeKey("exchangeUrlForQuote",e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e),e.has("selectedPaymentAsset")&&this.fetchQuote()}render(){return(0,n.dy)`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${["4","4","5","4"]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${["1","0","1","0"]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){let e=f.C.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return(0,n.dy)`
        <wui-flex
          .padding=${["4","3","4","3"]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?(0,n.dy)`<wui-text variant="lg-regular" color="primary">
                ${f.C.bigNumber(e,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:(0,n.dy)`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}let e=x.j.getPlainAddress(this.caipAddress)??"",{name:t,image:i}=this.getWalletProperties({namespace:this.namespace}),{icon:a,label:s}=eL[this.namespace]??{};return(0,n.dy)`
      <wui-flex
        .padding=${["4","3","4","3"]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${(0,r.o)(this.profileName)}
          address=${(0,r.o)(e)}
          imageSrc=${(0,r.o)(i)}
          alt=${(0,r.o)(t)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${(0,r.o)(s)}
          address=${(0,r.o)(e)}
          icon=${(0,r.o)(a)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${(0,r.o)(s)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){let e=o.R.state.activeChain;this.namespace=e,this.caipAddress=o.R.getAccountData(e)?.caipAddress,this.profileName=o.R.getAccountData(e)?.profileName??null,this.unsubscribe.push(o.R.subscribeChainProp("accountState",e=>this.onAccountStateChanged(e),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){let{chainId:t,chainNamespace:i}=w.u.parseCaipAddress(this.caipAddress),n=`${i}:${t}`;e=o.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===n)}await ea.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){let{address:e}=this.caipAddress?w.u.parseCaipAddress(this.caipAddress):{};ea.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let i=s.ConnectorController.getConnector({id:t,namespace:e});if(!i)return{name:void 0,image:void 0};let n=c.f.getConnectorImage(i);return{name:i.name,image:n}}paymentOptionsViewTemplate(){return(0,n.dy)`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){let e=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return(0,n.dy)`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(0===e.length)return(0,n.dy)`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;let t={disabled:this.isFetchingQuote};return(0,n.dy)`<w3m-pay-options
      class=${(0,ec.$)(t)}
      .options=${e}
      .selectedPaymentAsset=${(0,r.o)(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?(0,n.dy)`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:(0,n.dy)`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){let e=this.isFetchingQuote||this.isFetchingTokenBalances,t=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||!!this.quoteError,i=f.C.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?e||t?(0,n.dy)`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:(0,n.dy)`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:(0,n.dy)`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${e||t?(0,n.dy)`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:(0,n.dy)`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${J(i)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:e,isDisabled:t})}
      </wui-flex>
    `}actionButtonTemplate(e){let t=q(this.quote),{isLoading:i,isDisabled:a}=e,r="Pay";return t.length>1&&0===this.completedTransactionsCount&&(r="Approve"),(0,n.dy)`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${i||this.isPaymentInProgress}
        ?disabled=${a||this.isPaymentInProgress}
        @click=${()=>{t.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${r}
        ${i?null:(0,n.dy)`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){return this.namespace?(this.tokenBalances[this.namespace]??[]).map(e=>{try{return function(e){let t=o.R.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.chainId),i=e.address;if(!t)throw Error(`Target network not found for balance chainId "${e.chainId}"`);if(E.g.isLowerCaseMatch(e.symbol,t.nativeCurrency.symbol))i="native";else if(x.j.isCaipAddress(i)){let{address:e}=w.u.parseCaipAddress(i);i=e}else if(!i)throw Error(`Balance address not found for balance symbol "${e.symbol}"`);return{network:t.caipNetworkId,asset:i,metadata:{name:e.name,symbol:e.symbol,decimals:Number(e.quantity.decimals),logoURI:e.iconUrl},amount:e.quantity.numeric}}(e)}catch(e){return null}}).filter(e=>!!e).filter(e=>{let{chainId:t}=w.u.parseCaipNetworkId(e.network),{chainId:i}=w.u.parseCaipNetworkId(this.paymentAsset.network);return!!E.g.isLowerCaseMatch(e.asset,this.paymentAsset.asset)||!this.selectedExchange||!E.g.isLowerCaseMatch(t.toString(),i.toString())}):[]}onTokenBalancesChanged(e){this.tokenBalances=e;let[t]=this.getPaymentAssetFromTokenBalances();t&&ea.setSelectedPaymentAsset(t)}async onConnectOtherWallet(){await s.ConnectorController.connect(),await u.I.open({view:"PayQuote"})}onAccountStateChanged(e){let{address:t}=this.caipAddress?w.u.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,t){let{address:e}=this.caipAddress?w.u.parseCaipAddress(this.caipAddress):{};e?E.g.isLowerCaseMatch(e,t)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):u.I.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||ea.setSelectedPaymentAsset(e)}async onTransfer(){let e=D(this.quote);if(e){if(!E.g.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw Error("Quote asset is not the same as the selected payment asset");let t=this.selectedPaymentAsset?.amount??"0",i=f.C.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!f.C.bigNumber(t).gte(i)){p.SnackController.showError("Insufficient funds");return}if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){let{address:t}=w.u.parseCaipAddress(this.caipAddress);await ea.onTransfer({chainNamespace:this.namespace,fromAddress:t,toAddress:e.deposit.receiver,amount:i,paymentAsset:this.selectedPaymentAsset}),ea.setRequestId(e.requestId),l.RouterController.push("PayLoading")}}}async onSendTransactions(){let e=this.selectedPaymentAsset?.amount??"0",t=f.C.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!f.C.bigNumber(e).gte(t)){p.SnackController.showError("Insufficient funds");return}let i=q(this.quote),[n]=q(this.quote,this.completedTransactionsCount);n&&this.namespace&&(await ea.onSendTransaction({namespace:this.namespace,transactionStep:n}),this.completedTransactionsCount+=1,this.completedTransactionsCount===i.length&&(ea.setRequestId(n.requestId),l.RouterController.push("PayLoading")))}onPayWithExchange(){if(this.exchangeUrlForQuote){let e=x.j.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!e)throw Error("Could not create popup window");e.location.href=this.exchangeUrlForQuote;let t=D(this.quote);t&&ea.setRequestId(t.requestId),ea.initiatePayment(),l.RouterController.push("PayLoading")}}resetAssetsState(){ea.setSelectedPaymentAsset(null)}resetQuoteState(){ea.resetQuoteState()}};async function ej(e){return ea.handleOpenPay(e)}async function eF(e,t=3e5){if(t<=0)throw new I(A.INVALID_PAYMENT_CONFIG,"Timeout must be greater than 0");try{await ej(e)}catch(e){if(e instanceof I)throw e;throw new I(A.UNABLE_TO_INITIATE_PAYMENT,e.message)}return new Promise((e,i)=>{var n;let a=!1,r=setTimeout(()=>{a||(a=!0,o(),i(new I(A.GENERIC_PAYMENT_ERROR,"Payment timeout")))},t);function s(){if(a)return;let t=ea.state.currentPayment,i=ea.state.error,n=ea.state.isPaymentInProgress;if(t?.status==="SUCCESS"){a=!0,o(),clearTimeout(r),e({success:!0,result:t.result});return}if(t?.status==="FAILED"){a=!0,o(),clearTimeout(r),e({success:!1,error:i||"Payment failed"});return}!i||n||t||(a=!0,o(),clearTimeout(r),e({success:!1,error:i}))}let o=(n=[eQ("currentPayment",s),eQ("error",s),eQ("isPaymentInProgress",s)],()=>{n.forEach(e=>{try{e()}catch{}})});s()})}function eM(){return ea.getExchanges()}function ez(){return ea.state.currentPayment?.result}function eG(){return ea.state.error}function eW(){return ea.state.isPaymentInProgress}function eQ(e,t){return ea.subscribeKey(e,t)}eB.styles=eU,eD([(0,a.SB)()],eB.prototype,"profileName",void 0),eD([(0,a.SB)()],eB.prototype,"paymentAsset",void 0),eD([(0,a.SB)()],eB.prototype,"namespace",void 0),eD([(0,a.SB)()],eB.prototype,"caipAddress",void 0),eD([(0,a.SB)()],eB.prototype,"amount",void 0),eD([(0,a.SB)()],eB.prototype,"recipient",void 0),eD([(0,a.SB)()],eB.prototype,"activeConnectorIds",void 0),eD([(0,a.SB)()],eB.prototype,"selectedPaymentAsset",void 0),eD([(0,a.SB)()],eB.prototype,"selectedExchange",void 0),eD([(0,a.SB)()],eB.prototype,"isFetchingQuote",void 0),eD([(0,a.SB)()],eB.prototype,"quoteError",void 0),eD([(0,a.SB)()],eB.prototype,"quote",void 0),eD([(0,a.SB)()],eB.prototype,"isFetchingTokenBalances",void 0),eD([(0,a.SB)()],eB.prototype,"tokenBalances",void 0),eD([(0,a.SB)()],eB.prototype,"isPaymentInProgress",void 0),eD([(0,a.SB)()],eB.prototype,"exchangeUrlForQuote",void 0),eD([(0,a.SB)()],eB.prototype,"completedTransactionsCount",void 0),eB=eD([(0,m.Mo)("w3m-pay-quote-view")],eB);let eY={network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},eV={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eK={network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},eH={network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eX={network:"eip155:10",asset:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eJ={network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eZ={network:"eip155:137",asset:"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},e0={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},e1={network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},e3={network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},e2={network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},e5={network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},e4={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},e6={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}}},87969:(e,t,i)=>{var n=i(32119),a=i(89669),r=i(73540);i(79032);var s=i(19501),o=i(41492),c=i(20679);let l=(0,c.iv)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var u=function(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let d=class extends n.oi{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return(0,n.dy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,r.o)(this.iconSize)}></wui-icon>
    </button>`}};d.styles=[s.ET,s.ZM,l],u([(0,a.Cb)()],d.prototype,"icon",void 0),u([(0,a.Cb)()],d.prototype,"variant",void 0),u([(0,a.Cb)()],d.prototype,"type",void 0),u([(0,a.Cb)()],d.prototype,"size",void 0),u([(0,a.Cb)()],d.prototype,"iconSize",void 0),u([(0,a.Cb)({type:Boolean})],d.prototype,"fullWidth",void 0),u([(0,a.Cb)({type:Boolean})],d.prototype,"disabled",void 0),d=u([(0,o.M)("wui-icon-button")],d)},69537:(e,t,i)=>{i(76101)}};