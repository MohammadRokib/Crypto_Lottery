const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
        let raffle,
            vrfCoordinatorV2Mock,
            raffleEntranceFee,
            deployer,
            interval;
        const chainId = network.config.chainId;

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            raffle = await ethers.getContract("Raffle", deployer);
            raffleEntranceFee = await raffle.getEntranceFee();
            vrfCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer,
            );
            interval = await raffle.getInterval();
        });

        describe("Constructor", function () {
            it("Initializes the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState();
                const entranceFee = await raffle.getEntranceFee();

                assert.equal(raffleState.toString(), "0");
                assert.equal(
                    interval.toString(),
                    networkConfig[chainId]["interval"],
                );
                assert.equal(
                    entranceFee.toString(),
                    networkConfig[chainId]["entranceFee"],
                );
            });
        });

        describe("Enter Raffle", function () {
            it("Reverts when don't pay enough", async function () {
                await expect(raffle.enterRaffle()).to.be.revertedWith(
                    "Raffle__InsufficientETH",
                );
            });

            it("Stores player address when they enter", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                const contractPlayer = await raffle.getPlayer(0);
                assert.equal(contractPlayer, deployer);
            });

            it("Emits an event on enter", async function () {
                await expect(
                    raffle.enterRaffle({ value: raffleEntranceFee }),
                ).to.emit(raffle, "RaffleEnter");
            });

            it("Doesn't allow entrance when raffle is calculating", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                await raffle.performUpkeep([]);

                await expect(
                    raffle.enterRaffle({ value: raffleEntranceFee }),
                ).to.be.revertedWith("Raffle__NotOpen");
            });
        });

        describe("CheckUpKeep", function () {
            it("Returns false if no player participates", async function () {
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                    [],
                );

                assert(!upkeepNeeded);
            });

            it("Returns false if raffle isn't open", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                await raffle.performUpkeep([]);

                const raffleState = await raffle.getRaffleState();
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                    [],
                );

                assert.equal(raffleState.toString(), "1");
                assert.equal(upkeepNeeded, false);
            });

            it("Returns false if enough time hasn't passsed", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() - 2,
                ]);
                await network.provider.request({
                    method: "evm_mine",
                    params: [],
                });
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                    "0x",
                );

                assert(!upkeepNeeded);
            });

            it("Returns true if all the parameters are ture", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                    "0x",
                );

                assert(upkeepNeeded);
            });
        });

        describe("PerformUpKeep", function () {
            it("It can only run if checkupkeep is true", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                const tx = await raffle.performUpkeep([]);
                assert(tx);
            });

            it("Reverts if checkupkeep is false", async function () {
                await expect(raffle.performUpkeep([])).to.be.revertedWith(
                    "Raffle__UpkeepNotNeeded",
                );
            });

            it("Updates raffle state, Emits an event, Calls the vrf coordinator", async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
                const txResponse = await raffle.performUpkeep([]);
                const txReceipt = await txResponse.wait(1);
                const requestId = txReceipt.events[1].args.requestId;
                const raffleState = await raffle.getRaffleState();

                assert(requestId.toNumber() > 0);
                assert(raffleState.toString() == "1");
            });
        });

        describe("FulFillRandomWords", function () {
            beforeEach(async function () {
                await raffle.enterRaffle({ value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [
                    interval.toNumber() + 1,
                ]);
                await network.provider.send("evm_mine", []);
            });

            it("Can only be called after performUpKeep", async function () {
                await expect(
                    vrfCoordinatorV2Mock.fulfillRandomWords(
                        0,
                        raffle.address,
                    ),
                ).to.be.revertedWith("nonexistent request");
            });

            it("Picks a winner, Resets the lottery, Sends money", async function () {
                const additionalEntrants = 3;
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 4; i++) {
                    const connectAccount = raffle.connect(accounts[i]);
                    await connectAccount.enterRaffle({
                        value: raffleEntranceFee,
                    });
                }
                const startingTimeStamp = await raffle.getLatestTimeStamp();

                await new Promise(async (resolve, reject) => {
                    raffle.once("NewWinner", async () => {
                        console.log("Found the event");
                        try {
                            const recentWinner =
                                await raffle.getRecentWinner();
                            console.log(`Player-1: ${accounts[1].address}`);
                            console.log(`Player-2: ${accounts[2].address}`);
                            console.log(`Player-3: ${accounts[3].address}`);
                            console.log(`Winner: ${recentWinner}`);

                            const raffleState = await raffle.getRaffleState();
                            const endingTimeStamp =
                                await raffle.getLatestTimeStamp();
                            const numPlayers =
                                await raffle.getNumberOfPlayers();
                            const winnerEndingBalance =
                                await accounts[1].getBalance();

                            assert.equal(numPlayers.toString(), "0");
                            assert.equal(raffleState.toString(), "0");
                            assert(endingTimeStamp > startingTimeStamp);
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance
                                    .add(
                                        raffleEntranceFee
                                            .mul(3)
                                            .add(raffleEntranceFee)
                                            .toString()
                                    )
                            );
                        } catch (e) {
                            reject(e);
                        }
                        resolve();
                    });

                    const txResponse = await raffle.performUpkeep([]);
                    const txReceipt = await txResponse.wait(1);
                    const winnerStartingBalance =
                        await accounts[1].getBalance();
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address,
                    );
                });
            });
        });
    });
