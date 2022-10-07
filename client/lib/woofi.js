// last update Sep 8, 2022 afa8480 https://github.com/woonetwork/woofi_subgraph/commits/main/src/constants.ts

const WOOFI_SOURCES = {
  WOOFi: [
    '0xcef5be73ae943b77f9bc08859367d923c030a269',
    '0x114f84658c99aa6ea62e3160a87a16deaf7efe83',
    '0x53e255e8bbf4edf16797f9885291b3ca0c70b59f',
    '0xfe7c30860d01e28371d40434806f4a8fcdd3a098',
    '0xbf365ce9cfcb2d5855521985e351ba3bcf77fd3f',
    '0x8489d142da126f4ea01750e80ccaa12fd1642988',
    '0x10c24658815585851a8888f059cb4338790023f1',
    '0xf704eaf4a68ac424c809f7c4595451b9414d2b76',
  ],
  '1inch': [
    '0x1111111254fb6c44bac0bed2854e76f90643097d',
    '0x3790c9b5a9b9d9aa1c69140a5f01a57c9b868e1e',
    '0x2a71693a4d88b4f6ae6697a87b3524c04b92ab38',
    '0x11111112542d85b3ef69ae05771c2dccff4faa26',
    '0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643',
    '0x9c4350f527ff7f96b650ee894ae9103bdfec0432',
    '0x05ad60d9a2f1aa30ba0cdbaf1e0a0a145fbea16f',
    '0x2ed740c6e3aaf5987c7f5a4fa13b90fcc47febd7',
  ],
  DODO: [
    '0x6b3d817814eabc984d51896b1015c0b89e9737ca',
    '0x8f8dd7db1bda5ed3da8c9daf3bfa471c12d58486',
    '0xbce44767af0a53a108b3b7ba4f740e03d228ec0a',
    '0xa128ba44b2738a558a1fdc06d6303d52d3cef8c1',
    '0x187da347debf4221b861eeafc9808d8cf89cf5fe',
  ],
  OpenOcean: [
    '0x6dd434082eab5cd134b33719ec1ff05fe985b97b',
    '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    '0x170100a288dc3d7e83fea20441f98166b15b6df0',
  ],
  MetaMask: [
    '0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31',
  ],
  YieldYak: [
    '0x0000000000000000000000000000000000000000',
  ],
  FireBird: [
    '0x92e4f29be975c1b1eb72e77de24dccf11432a5bd',
    '0xb97922afa65c46a1babbf70031f7224bd3449c8e',
  ],
  BitKeep: [
    '0x0c9adcfc5fc5c34074bd67e402c5f9cb14ba2920',
    '0x22fefbe577a4dbc083bee213e546ac69aedc2c56',
    '0x2a07cb9e1236a31c6e4cfd7dfd39cf1e0c5687d6',
    '0xb64d61fa39a7343a3d85e20da612e08dc7500af0'
  ],
  ParaSwap: [
    '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
  ],
  BeethovenX: [
    '0x0000000000000000000000000000000000000000',
  ],
  TransitSwap: [
    '0x638f32fe09baec1fdc54f962e3e8e5f2b286aa70',
    '0x09c0fa8e2cd5fb18a9cb41c8daa951d9a4b09d7a',
    '0x457b4c2ab9905b48511ad0d343ba528a0af5045b',
  ],
  '0x': [
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    '0xdb6f1920a889355780af7570773609bd8cb1f498',
  ],
}

const SOURCES_BY_ADDRESS = {}
for (const key in WOOFI_SOURCES) {
  for (const address of WOOFI_SOURCES[key]) {
    SOURCES_BY_ADDRESS[address] = key
  }
}

export function getAddressLabel(address) {
  return SOURCES_BY_ADDRESS[address]
    ? SOURCES_BY_ADDRESS[address]
    : `${address.slice(2,6)}..${address.slice(-4)}`
}
