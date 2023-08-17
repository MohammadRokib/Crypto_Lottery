const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              raffle = await ethers.getContract("Raffle", deployer);
              raffleEntranceFee = await raffle.getEntranceFee();
          });

          describe("FulFillRandomWords", function () {
              it("Works with live Chainlink Automation and Chainlink VRF, we get a random winner", async function () {
                  console.log("Setting up test...");

                  const startingTimeStamp = await raffle.getLatestTimeStamp();
                  const accounts = await ethers.getSigners();

                  console.log("Setting up Listener....");
                  await new Promise(async (resolve, reject) => {
                      raffle.once("NewWinner", async () => {
                          console.log("Winner Picked event fired");
                          try {
                              const recentWinner =
                                  await raffle.getRecentWinner();
                              const raffleState = await raffle.getRaffleState();
                              const winnerEndingBalance =
                                  await accounts[0].getBalance();
                              const endingTimeStamp =
                                  await raffle.getLatestTimeStamp();

                              await expect(raffle.getPlayer(0)).to.be.reverted;
                              assert.equal(
                                  recentWinner.toString(),
                                  accounts[0].address
                              );
                              assert.equal(raffleState.toString(), "0");
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(raffleEntranceFee)
                                      .toString()
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve();
                          } catch (e) {
                              console.log(e);
                              reject(e);
                          }
                      });
                      console.log("Entering Raffle....");
                      let balance = accounts[0].getBalance();
                      console.log(`Balance: ${balance}`);
                      
                      const txResponse = raffle.enterRaffle({ value: raffleEntranceFee });
                      balance = accounts[0].getBalance();
                      console.log(`Balance: ${balance}`);
                      await txResponse.wait(1);

                      balance = accounts[0].getBalance();
                      console.log(`Balance: ${balance}`);

                      console.log("Waiting to pick the winner");
                      const winnerStartingBalance =
                          await accounts[0].getBalance();
                  });
              });
          });
      });
