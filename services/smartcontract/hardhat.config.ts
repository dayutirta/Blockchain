import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
      viaIR: true,
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8546",
    },
    besu: {
      url: "http://172.20.37.110:8545",
      accounts: ["0x336851f1beaa788a60b810d4b74676029456895ce6d2572219d49faa61ba54d0"],
      gasPrice: 0,
      gas: 0x1ffffffffffffe,
      chainId: 1337,
    },
  },
};
export default config;
