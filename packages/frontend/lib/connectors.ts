  import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  42: 'https://kovan.infura.io/v3/2744d6804cea48b794b29b7417711ee4',
  80001: 'https://polygon-mumbai.g.alchemy.com/v2/X-Sa4IgzmrFpewM6kMBbb23B578ivp6e',
}
export const walletconnect = new WalletConnectConnector({
  rpc: { 42: RPC_URLS[42], 80001: RPC_URLS[80001] },
  qrcode: true,
  // pollingInterval: POLLING_INTERVAL,
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[42],
  appName: 'Coinbase',
  supportedChainIds: [ 42, 80001],
})
