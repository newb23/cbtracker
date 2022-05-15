var subs = []
var sales = []
var wssWeb3;

var wssNodes = {
  bnb: 'wss://bsc-ws-node.nariox.org:443',
  heco: 'ws://pub001.hg.network/ws',
  oec: 'wss://exchainws.okex.org:8443',
  poly: 'wss://ws-matic-mainnet.chainstacklabs.com',
  avax: 'wss://api.avax.network/ext/bc/C/ws',
  aurora: 'wss://mainnet.aurora.dev'
}

var marketAddress = $('#market-address')
var marketResult = $('#market-result')

var marketEvent = _.find(
  NFTMarket,
  (i) => i.name === 'PurchasedListing',
);

function init(){
  var options = {
    timeout: 60000,
    clientConfig: {
      maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
      maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
      keepalive: true,
      keepaliveInterval: 30000, // ms
    },
    reconnect: {
      auto: true,
      delay: 1000, // ms
      maxAttempts: 5,
      onTimeout: false,
    },
  };
  wssWeb3 = new Web3(new Web3.providers.WebsocketProvider(wssNodes[currentNetwork], options))
  subs = getSubscribedAddress() || []
  sales = getSales() || []
  marketAddress.html('');
  marketResult.html('');
  if(subs.length > 0) {
    subs.forEach(address => {
      marketAddress.append(`${address}\n`)
    })
  }
  if(sales.length > 0) {
    sales.forEach(data => {
      marketResult.append(`${data.type},${data.id},${data.price},${data.seller},${data.date},${data.txHash}\n`)
    })
  }

  var listener = wssWeb3.eth.subscribe('logs', {
    address: conAddress[currentNetwork].market,
    topics: [],
  });

  listener.on('connected', () => {
    console.log('connected')
  })

  listener.on('error', () => {
    console.log('disconnected')
    listener.unsubscribe(() => {
      init()
    })
  })

  listener.on('data', async (data) => {
    if (data.topics[0] === '0x7762d23dc0afc60972698afa4f7ab7e5853e961dad5c968fe29b0fd3b14fffb5') {
      var returnValues = web3.eth.abi.decodeLog(
        marketEvent.inputs,
        data.data,
        data.topics.slice(1),
      );
      var date = new Date().getTime();

      if (subs.includes(returnValues.seller)) {
        if (!sales.find(i => i.transactionHash === data.transactionHash)) {
          var {seller, nftAddress, nftID, price} = returnValues
          var type = getNFTType(nftAddress)
          var realPrice = parseFloat(fromEther(price)).toFixed(6)
          marketResult.append(`${type},${nftID},${realPrice},${seller},${date},${data.transactionHash}\n`)
          storeSales({
            type,
            seller,
            id: nftID,
            price: realPrice,
            date,
            txHash: data.transactionHash
          })
        }
      }
    }
  });
}

function getSubscribedAddress() {
  return JSON.parse(localStorage.getItem('market'))
}

function getSales(){
  return JSON.parse(localStorage.getItem(`sales-${currentNetwork}`))
}

function subscribeAddress(address){
  if (subs.find(account => account === address)) return
  console.log('Subscribed:', address)
  if (isAddress(address)) {
      $('#modal-set-account').modal('hide');
      subs.push(address)
      if (subs) localStorage.setItem('market', JSON.stringify(subs))
  }
}

function storeSales(data){
  sales.push(data)
  if (sales) localStorage.setItem(`sales-${currentNetwork}`, JSON.stringify(sales))
}

function getNFTType(address) {
  if (address === conAddress[currentNetwork].character) return 'character';
  else if (address === conAddress[currentNetwork].weapon) return 'weapon';
  else if (address === conAddress[currentNetwork].shield) return 'shield';
  else if (address === conAddress[currentNetwork].junk) return 'junk';
  else return 'unknown'
}

async function setAccount() {
  var address = $('#logger-address').val().trim()
  if (!Object.keys(subs).includes(address) && isAddress(address)) {
      subscribeAddress(address)
      marketAddress.append(`${address}\n`)
      $('#logger-address').val('')
      $('#modal-set-account').modal('hide')
  }
}

$("#select-network").on('change', async (e) => {
  updateNetwork(e.currentTarget.value)
  init()
})

init()
