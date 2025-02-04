export const proposeEnvelope = {
  address: '0x0538D033B879aC94C709c1E408CC081345427379',
  sig: '0x33bbb847e30b943aadc6101e20fbd32da3804d2b217767882cacfb85bd5e8d5a1a81dfa00b5ceec8945545276f56dd2a1190ac129b3f39bad5789a4397d8e3621b',
  data: {
    domain: { name: 'snapshot-x', version: '1', chainId: 5 },
    types: {
      Propose: [
        { name: 'authenticator', type: 'bytes32' },
        { name: 'space', type: 'bytes32' },
        { name: 'author', type: 'address' },
        { name: 'metadata_uri', type: 'string' },
        { name: 'executor', type: 'bytes32' },
        { name: 'execution_hash', type: 'bytes32' },
        { name: 'strategies_hash', type: 'bytes32' },
        { name: 'strategies_params_hash', type: 'bytes32' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    message: {
      space: '0x07e6e9047eb910f84f7e3b86cea7b1d7779c109c970a39b54379c1f4fa395b28',
      authenticator: '0x064cce9272197eba6353f5bbf060e097e516b411e66e83a9cf5910a08697df14',
      strategies: [1],
      executor: '0x04ecc83848a519cc22b0d0ffb70e65ec8dde85d3d13439eff7145d4063cf6b4d',
      metadataUri: 'ipfs://QmNrm6xKuib1THtWkiN5CKtBEerQCDpUtmgDqiaU2xDmca',
      executionParams: [],
      author: '0x0538D033B879aC94C709c1E408CC081345427379',
      executionHash: '0x049ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804',
      strategiesHash: '0x078d74f61aeaa8286418fd34b3a12a610445eba11d00ecc82ecac2542d55f7a4',
      strategiesParamsHash: '0x04c643e1ba37b388f483a9dce226443876069bc87ff7ed6763c1f12048ff5cf9',
      salt: 0
    }
  }
};

export const voteEnvelope = {
  address: '0x0538D033B879aC94C709c1E408CC081345427379',
  sig: '0x529b909b496194a9d4b4fed0f30264943cc25d430352fcf0e5dc0baa7dbeb6f60de20dd6edf8db193bdf39c1c0cfcdf3895927cae31e88c4c28b9eacf736c2401c',
  data: {
    domain: { name: 'snapshot-x', version: '1', chainId: 5 },
    types: {
      Vote: [
        { name: 'authenticator', type: 'bytes32' },
        { name: 'space', type: 'bytes32' },
        { name: 'voter', type: 'address' },
        { name: 'proposal', type: 'uint256' },
        { name: 'choice', type: 'uint256' },
        { name: 'strategies_hash', type: 'bytes32' },
        { name: 'strategies_params_hash', type: 'bytes32' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    message: {
      space: '0x07e6e9047eb910f84f7e3b86cea7b1d7779c109c970a39b54379c1f4fa395b28',
      authenticator: '0x064cce9272197eba6353f5bbf060e097e516b411e66e83a9cf5910a08697df14',
      strategies: [1],
      proposal: 3,
      choice: 1,
      voter: '0x0538D033B879aC94C709c1E408CC081345427379',
      strategiesHash: '0x078d74f61aeaa8286418fd34b3a12a610445eba11d00ecc82ecac2542d55f7a4',
      strategiesParamsHash: '0x04c643e1ba37b388f483a9dce226443876069bc87ff7ed6763c1f12048ff5cf9',
      salt: 0
    }
  }
};
