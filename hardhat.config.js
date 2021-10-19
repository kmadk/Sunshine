"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('@eth-optimism/hardhat-ovm');

// Include the Etherscan contract verifier.
require('@nomiclabs/hardhat-etherscan');

exports.default = {
    solidity: "0.7.6",
    networks: {
        optimisticKovan: {
        url: 'https://kovan.optimism.io',
        ovm: true,
        accounts: { mnemonic: '' },
        gasPrice: 15000000,
      }
    },
    etherscan: { apiKey: '' },
    ovm: {
        solcVersion: '0.7.6'
      }
};
