require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { INFURA_GOERLI_URL, GOERLI_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `${INFURA_GOERLI_URL}`,
      accounts: [`0x${GOERLI_PRIVATE_KEY}`],
      gasPrice: "auto",
      gas: "auto"
    }
  },
};

task("deployContracts", "Deploys contracts on the provided network")
  .setAction(async () => {
    const deployContracts = require("./scripts/deploy");
    await deployContracts();
  });

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });