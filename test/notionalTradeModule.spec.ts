import chai from "chai";
import { solidity } from "ethereum-waffle";
import { NotionalViews } from "../typechain";
import { ethers } from "hardhat";

chai.use(solidity);
const expect = chai.expect;


describe("Notional views", () => {
  const notionalAddress = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369";
  let notional: NotionalViews;

  beforeEach(async () => {
    notional = (await ethers.getContractAt(
      "NotionalViews",
      notionalAddress,
    )) as NotionalViews;
  });

  describe("Notional setup", async () => {
    // cacheBeforeEach(initialize);

    const daiCurrencyId = 2;

    it("max currency id should work", async () => {
      const maxCurrencyId = await notional.getMaxCurrencyId();
      expect(maxCurrencyId).to.eq(4);
    });

    it("getCurrencyId should work", async () => {
      const cdaiAddress = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
      const currencyId = await notional.getCurrencyId(cdaiAddress);
      expect(currencyId).to.eq(daiCurrencyId);
    });

    describe("When currencyId is valid", () => {
      [1, 2, 3, 4].forEach((currencyId) => {
        describe(`With currencyId: ${currencyId}`, () => {
          it("getCurrency should work", async () => {
            const { underlyingToken, assetToken } = await notional.getCurrency(currencyId);

            console.log("Underlying token", {
              assetAddress: assetToken.tokenAddress,
              underlyingAddress: underlyingToken.tokenAddress,
            });
          });

          it("getDepositParameters should work", async () => {
            await notional.getDepositParameters(currencyId);
          });

          it("getInitializationParameters should work", async () => {
            await notional.getInitializationParameters(currencyId);
          });

          it("getRateStorage should work", async () => {
            await notional.getRateStorage(currencyId);
          });

          it("getCurrencyAndRates should work", async () => {
            await notional.getCurrencyAndRates(currencyId);
          });

          // it("getActiveMarkets should work", async () => {
          //   const latestBlock = await ethers.provider.getBlock("latest");
          //   console.log("Latest block before calling getActiveMarkets:", latestBlock);
          //   const activeMarkets = await notional.getActiveMarkets(currencyId);
          //   console.log("activeMarkets:", activeMarkets);
          // });

          describe("When the maturity is valid", () => {
              let maturity: number;
              let referenceTime: number;
              beforeEach(async () => {
                  const secondsInQuarter = 3 * 30 * 24 * 60 * 60;
                  console.log("secondsInQuarter:", secondsInQuarter);
                  const latestBlock = await ethers.provider.getBlock("latest");
                  const blockTime = latestBlock.timestamp;
                  referenceTime = blockTime - (blockTime % secondsInQuarter);
                  const quarters = referenceTime / secondsInQuarter;
                  console.log(`${quarters} since 1st of January 1970`);

                  maturity = referenceTime + secondsInQuarter;
                  console.log("maturity:", maturity);
                  console.log("maturity date:", new Date(maturity * 1000).toISOString());
              })
              it("getSettlementRate should work", async () => {
                  const settlementRate = await notional.getSettlementRate(currencyId, maturity);
                  console.log("settlementRate:", settlementRate);
              });

              it("getMarket should work", async () => {
                  const marketData = await notional.getMarket(currencyId, maturity, maturity);
                  console.log("marketData:", marketData);
              });
          })
        

        });
      });
    });
    describe("When currency id is invalid", () => {
      const invalidCurrencyId = 99;
      it("getActiveMarkets should revert correctly", async () => {
        await expect(notional.getActiveMarkets(invalidCurrencyId)).to.be.revertedWith(
          "Invalid currency id",
        );
      });
    });
  });
});
