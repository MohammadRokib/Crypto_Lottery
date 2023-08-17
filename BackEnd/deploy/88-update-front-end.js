const { ethers, network } = require("hardhat");
const fs = require("fs");

const ADDRESS_FILE = "../../Tests/nextjs_lottery/constants/contractAddresses.json";
const ABI_FILE = "../../Tests/nextjs_lottery/constants/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end....");
    updateContractAddress();
    updateAbi();
  }
};

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json));
}

async function updateContractAddress() {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId.toString();
  const currentAddress = JSON.parse(fs.readFileSync(ADDRESS_FILE, "utf8"));

  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(raffle.address)) {
      currentAddress[chainId].push(raffle.address);
    }
  } {
    currentAddress[chainId] = [raffle.address];
  }
  fs.writeFileSync(ADDRESS_FILE, JSON.stringify(currentAddress));
}

module.exports.tags = ["all", "frontend"];
