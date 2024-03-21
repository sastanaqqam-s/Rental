import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { BLCToken, Wrapped, Wrapped__factory } from "../typechain";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { exit } from "process";

import { basicMethod } from "./fixture/index";

var nftID1 = BigNumber.from(1);
var nftID2 = BigNumber.from(2);

var rentpersecond = 1;

function decimal(value: any) {
  const powValue = BigNumber.from("10").pow(18);
  return BigNumber.from(value).mul(powValue);
}

function addDecimal(value: any) {
  const powValue = BigNumber.from("10").pow(18);
  const totalToken = BigNumber.from(1000000).mul(powValue);
  return BigNumber.from(value).add(totalToken);
}

function subDecimal(value: any) {
  const powValue = BigNumber.from("10").pow(18);
  const totalToken = BigNumber.from(1000000).mul(powValue);
  return totalToken.sub(value);
}

async function addPackage(rentNFTContract: any, deployer: any) {
  let _requiredtime = "86400";
  let packagageID = [0, 1, 2, 3, 4, 5, 6];
  let discountinbps = [0, 1, 2, 3, 4, 5, 6];

  for (let i = 1; i <= 5; i++) {
    if (i % 2) {
      await rentNFTContract
        .connect(deployer)
        ._addUpdatepackage(
          BigNumber.from(i).mul(_requiredtime),
          discountinbps[i],
          packagageID[i],
        );
    } else {
      await rentNFTContract
        .connect(deployer)
        ._addUpdatepackage(
          BigNumber.from(i + 2).mul(_requiredtime),
          discountinbps[i] + 2,
          packagageID[i],
        );
    }
  }
}

async function listNFTForRent(nftId: any, rentpersecond: any) {
  const {
    nftContract,
    expiresAfter,
    minumumDuration,
    maximumDuration,
    rentNFTContract,
    bestResolution,
    aspectRatio,
    category,
    users,
  } = await loadFixture(basicMethod);

  await rentNFTContract
    .connect(users[1])
    .listNFTForRent(
      nftId,
      nftContract.address,
      expiresAfter,
      minumumDuration,
      maximumDuration,
      rentpersecond,
      bestResolution,
      aspectRatio,
      category,
    );
}

describe("Rental Contract", () => {
  let duration0: number;
  let duration1: number;
  let duration2: number;
  let duration3: number;
  let packageID: number[];
  let discountinbps: number[];

  beforeEach(async () => {
    const { startDate, endDate, endDate1, endDate2, endDate3 } =
      await loadFixture(basicMethod);

    duration0 = endDate - startDate;
    duration1 = endDate1 - endDate;
    duration2 = endDate2 - endDate1;
    duration3 = endDate3 - endDate2;

    packageID = [0, 1, 2, 3, 4, 5, 6];
    discountinbps = [0, 1, 2, 3, 4, 5, 6];
  });
  //

  describe("Set Mapping Variables Value", () => {
    it("Should check Change Owner of the Contract", async function () {
      const { rentNFTContract, deployer, users } = await loadFixture(
        basicMethod,
      );
      expect(await rentNFTContract.owner()).to.equal(deployer.address);
      await rentNFTContract
        .connect(deployer)
        .changeContractOwner(users[1].address);
      expect(await rentNFTContract.owner()).to.equal(users[1].address);
    });

    // update feetoken
    it("Should check changeFeetoken update or not", async () => {
      const { rentNFTContract, blcContract, newBlcContract } =
        await loadFixture(basicMethod);
      expect(await rentNFTContract.feetoken()).to.equal(blcContract.address);

      await rentNFTContract.changeFeetoken(newBlcContract.address);

      expect(await rentNFTContract.feetoken()).to.equal(newBlcContract.address);
    });

    // update rent comission percentage
    it("Should check rent comission update or not", async function () {
      const { rentNFTContract, deployer, users } = await loadFixture(
        basicMethod,
      );
      await rentNFTContract.connect(deployer).changeRentCommision(10);
      expect(await rentNFTContract.rentCommision()).to.equal(
        BigNumber.from(10),
      );
    });

    // update buy sell comission percentage
    it("Should check buy sell comission update or not", async function () {
      const { rentNFTContract, deployer, users } = await loadFixture(
        basicMethod,
      );
      await rentNFTContract.connect(deployer).changeBuySellCommision(5);
      expect(await rentNFTContract.buySellCommision()).to.equal(
        BigNumber.from(5),
      );
    });
  });

  describe("Add Package Method", () => {
    it("Should check for Add Update Package and check value is same", async function () {
      const { rentNFTContract, deployer, users } = await loadFixture(
        basicMethod,
      );

      let _requiredtime = "86400";
      let discountinbps = 5;
      let packageID = [1, 3, 5, 4, 2];

      for (let i = 0; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps, packageID[i]);
      }

      // check package with id's

      for (let i = 0; i < packageID.length; i++) {
        expect(await rentNFTContract.packages(packageID[i])).to.deep.equals([
          BigNumber.from(_requiredtime),
          BigNumber.from(discountinbps),
        ]);
      }
    });

    it("Should check Events for Package Method", async function () {
      const { rentNFTContract, deployer } = await loadFixture(basicMethod);

      let _requiredtime = "86400";
      let discountinbps = 5;
      let packageID = 1;

      expect(
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps, packageID),
      )
        .to.emit(rentNFTContract, "addUpdatepackage")
        .withArgs(packageID, _requiredtime, discountinbps);
    });

    it("Should check Revert for Package Method", async function () {
      const { rentNFTContract, deployer, users } = await loadFixture(
        basicMethod,
      );

      let _requiredtime = "86400";
      let discountinbps = 5;
      let packageID = 1;

      await expect(
        rentNFTContract
          .connect(users[1])
          ._addUpdatepackage(_requiredtime, discountinbps, packageID),
      ).to.be.revertedWith("Only owner can do this action!");

      await expect(
        rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps, 0),
      ).to.be.revertedWith("zero package id is reserved!");
    });
  });

  describe("List NFT for Rent Method", () => {
    it("Should check for Add listNFTForRent and check value is same", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        users,
      } = await loadFixture(basicMethod);

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      let nftonrent = await rentNFTContract.allNFT(BigNumber.from(1));
      let nftonrent2 = await rentNFTContract.allNFT(BigNumber.from(2));

      expect(nftonrent).to.have.deep.members([
        BigNumber.from(nftID1),
        nftContract.address,
        BigNumber.from(nftonrent.expiresAt),
        BigNumber.from(minumumDuration),
        BigNumber.from(maximumDuration),
        BigNumber.from(rentpersecond),
        bestResolution,
        aspectRatio,
        category,
        users[1].address,
        BigNumber.from(0),
      ]);

      expect(nftonrent2).to.have.deep.members([
        BigNumber.from(nftID2),
        nftContract.address,
        BigNumber.from(nftonrent.expiresAt),
        BigNumber.from(minumumDuration),
        BigNumber.from(maximumDuration),
        BigNumber.from(rentpersecond),
        bestResolution,
        aspectRatio,
        category,
        users[1].address,
        BigNumber.from(0),
      ]);
    });

    it("Should check total lend nft count", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
      } = await loadFixture(basicMethod);

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      expect(await rentNFTContract.totalInventory()).to.equal(
        BigNumber.from(2),
      );
    });

    it("Should check for owner of nft", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        users,
      } = await loadFixture(basicMethod);

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      expect(await nftContract.balanceOf(rentNFTContract.address)).to.equal(
        BigNumber.from(2),
      );

      expect(await nftContract.ownerOf(1)).to.equal(rentNFTContract.address);
      expect(await nftContract.ownerOf(1)).to.equal(rentNFTContract.address);
    });

    it("Should check Events for listNFTForRent Method", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        users,
      } = await loadFixture(basicMethod);

      expect(await listNFTForRent(nftID1, rentpersecond))
        .to.emit(rentNFTContract, "NFTListed")
        .withArgs(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          bestResolution,
          aspectRatio,
          category,
          nftID1,
          users[1].address,
          decimal(rentpersecond),
        );
    });

    it("Should check Revert Method for listNFTForRent", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        deployer,
      } = await loadFixture(basicMethod);

      await expect(listNFTForRent(3, rentpersecond)).to.be.reverted;
    });
  });

  describe("Unlist NFT for Rent Method", () => {
    it("Should check for Nft is available for unlisted or not", async function () {
      const { rentNFTContract } = await loadFixture(basicMethod);

      await listNFTForRent(nftID1, rentpersecond);

      expect(
        await rentNFTContract.unlistedNFTCheck(BigNumber.from(1)),
      ).to.equal(true);
    });

    it("Should check for Nft is Unlisted is not reverted", async function () {
      const { rentNFTContract, users } = await loadFixture(basicMethod);

      await listNFTForRent(nftID1, rentpersecond);
      await expect(rentNFTContract.connect(users[1]).unlistNFTForRent(1)).to.be
        .not.reverted;
    });

    it("Should check for owner of nft is Unlisted", async function () {
      const { nftContract, rentNFTContract, users } = await loadFixture(
        basicMethod,
      );

      await listNFTForRent(nftID1, rentpersecond);
      await rentNFTContract.connect(users[1]).unlistNFTForRent(1);

      expect(await nftContract.ownerOf(BigNumber.from(nftID1))).to.be.equals(
        users[1].address,
      );

      expect(await nftContract.balanceOf(users[1].address)).to.equal(
        BigNumber.from(2),
      );

      expect(await nftContract.balanceOf(rentNFTContract.address)).to.equal(
        BigNumber.from(0),
      );
    });

    it("Should check Events for Unlisted NFT Method", async function () {
      const { rentNFTContract, users, itemId } = await loadFixture(basicMethod);

      await listNFTForRent(nftID1, rentpersecond);
      expect(await rentNFTContract.connect(users[1]).unlistNFTForRent(1))
        .to.emit(rentNFTContract, "NFTUNListed")
        .withArgs(itemId);
    });

    it("Should check Revert Method for Unlisted NFT", async function () {
      const { rentNFTContract, users, itemId, startDate, endDate } =
        await loadFixture(basicMethod);

      await listNFTForRent(nftID1, rentpersecond);

      await expect(
        rentNFTContract.connect(users[2]).unlistNFTForRent(1),
      ).to.be.revertedWith("only owner can unlist");

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      await expect(
        rentNFTContract.connect(users[1]).unlistNFTForRent(1),
      ).to.be.revertedWith("already booked for future period");
    });
  });

  describe("Calculate Rent Method", () => {
    it("Should check for Calculate rent", async function () {
      const {
        rentNFTContract,
        startDate,
        endDate,
        endDate1,
        endDate2,
        users,
        itemId,
      } = await loadFixture(basicMethod);

      rentpersecond = 3;
      let duration0 = duration2;
      let calculateRent = rentpersecond * duration0;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      await rentNFTContract.connect(users[3]).rentNFTMultiple([
        [
          BigNumber.from(1),
          BigNumber.from(endDate),
          BigNumber.from(endDate1),
          BigNumber.from("0"),
        ],
        [
          BigNumber.from(1),
          BigNumber.from(endDate1),
          BigNumber.from(endDate2),
          BigNumber.from("0"),
        ],
      ]);

      expect(await rentNFTContract.calculateRent(1, duration0)).to.equals(
        BigNumber.from(calculateRent),
      );
    });
  });

  describe("Renting Method", () => {
    it("Should check for Rent Nft", async function () {
      const { rentNFTContract, startDate, endDate, users, itemId } =
        await loadFixture(basicMethod);

      rentpersecond = 3;
      let rentCommission = 10;

      let calculateRent = rentpersecond * duration0;
      let totalCalculateRent =
        calculateRent - (calculateRent * rentCommission) / 100;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      // wrapped contract detail
      let wrappednft = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[0];

      let testNFTContract = Wrapped__factory.connect(
        wrappednft.wrappedNFT,
        users[3],
      );

      let getItemDetail = await rentNFTContract.getItemDetail(
        BigNumber.from(1),
      );

      expect(getItemDetail).to.have.deep.members([
        [
          testNFTContract.address,
          BigNumber.from(endDate),
          BigNumber.from(startDate),
          BigNumber.from(totalCalculateRent),
        ],
      ]);
    });

    it("Should check for Rent Nft for Multiple", async function () {
      const {
        rentNFTContract,
        startDate,
        endDate,
        endDate1,
        endDate2,
        users,
        itemId,
      } = await loadFixture(basicMethod);

      rentpersecond = 3;
      let rentCommission = 10;

      let calculateRent = duration0 * rentpersecond;
      let totalCalculateRent1 =
        calculateRent - (calculateRent * rentCommission) / 100;

      let calculateRent1 = duration1 * rentpersecond;
      let totalCalculateRent2 =
        calculateRent1 - (calculateRent1 * rentCommission) / 100;

      let calculateRent2 = duration2 * rentpersecond;
      let totalCalculateRent3 =
        calculateRent2 - (calculateRent2 * rentCommission) / 100;

      await listNFTForRent(nftID1, rentpersecond);

      // rent multiple method
      await rentNFTContract.connect(users[1]).rentNFTMultiple([
        [
          BigNumber.from(itemId),
          BigNumber.from(startDate),
          BigNumber.from(endDate),
          BigNumber.from("0"),
        ],
        [
          BigNumber.from(itemId),
          BigNumber.from(endDate),
          BigNumber.from(endDate1),
          BigNumber.from("0"),
        ],
        [
          BigNumber.from(itemId),
          BigNumber.from(endDate1),
          BigNumber.from(endDate2),
          BigNumber.from("0"),
        ],
      ]);

      // wrapped contract detail
      let wrappednft0 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[0];
      let wrappednft1 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[1];
      let wrappednft2 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[2];

      // get contract address
      let testNFTContract1 = Wrapped__factory.connect(
        wrappednft0.wrappedNFT,
        users[3],
      );
      let testNFTContract2 = Wrapped__factory.connect(
        wrappednft1.wrappedNFT,
        users[3],
      );
      let testNFTContract3 = Wrapped__factory.connect(
        wrappednft2.wrappedNFT,
        users[3],
      );

      let getItemDetail = await rentNFTContract.getItemDetail(
        BigNumber.from(1),
      );

      expect(getItemDetail).to.have.deep.members([
        [
          testNFTContract1.address,
          BigNumber.from(endDate),
          BigNumber.from(startDate),
          BigNumber.from(totalCalculateRent1),
        ],
        [
          testNFTContract2.address,
          BigNumber.from(endDate1),
          BigNumber.from(endDate),
          BigNumber.from(totalCalculateRent2),
        ],
        [
          testNFTContract3.address,
          BigNumber.from(endDate2),
          BigNumber.from(endDate1),
          BigNumber.from(totalCalculateRent3),
        ],
      ]);
    });

    it("Should check calculate rent for NFT owner", async function () {
      const {
        rentNFTContract,
        nftContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        startDate,
        endDate,
        users,
        itemId,
      } = await loadFixture(basicMethod);

      let rentcommision = 10;

      let calculateRent = duration0 * rentpersecond;
      let ownerCommission = (calculateRent * rentcommision) / 100;
      let totalNFTOwnerBal = calculateRent - ownerCommission;

      // add packages
      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      let nftonrent = await rentNFTContract.allNFT(BigNumber.from(1));

      expect(nftonrent).to.have.deep.members([
        BigNumber.from(nftID1),
        nftContract.address,
        BigNumber.from(nftonrent.expiresAt),
        BigNumber.from(minumumDuration),
        BigNumber.from(maximumDuration),
        BigNumber.from(rentpersecond),
        bestResolution,
        aspectRatio,
        category,
        users[1].address,
        BigNumber.from(totalNFTOwnerBal),
      ]);
    });

    it("Should check rent nft between periods", async function () {
      const {
        rentNFTContract,
        startDate,
        endDate,
        endDate1,
        endDate2,
        endDate3,
        users,
        itemId,
      } = await loadFixture(basicMethod);

      let rentCommission = 10;

      let calculateRent = rentpersecond * duration0;
      let totalCalculateRent =
        calculateRent - (calculateRent * rentCommission) / 100;

      let calculateRent1 = rentpersecond * duration1;
      let totalCalculateRent1 =
        calculateRent1 - (calculateRent1 * rentCommission) / 100;

      let calculateRent2 = rentpersecond * duration2;
      let totalCalculateRent2 =
        calculateRent2 - (calculateRent2 * rentCommission) / 100;

      let calculateRent3 = rentpersecond * duration3;
      let totalCalculateRent3 =
        calculateRent3 - (calculateRent3 * rentCommission) / 100;

      // add packages
      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, endDate, endDate1, BigNumber.from("0"));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, endDate2, endDate3, BigNumber.from("0"));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, endDate1, endDate2, BigNumber.from("0"));

      let getItemDetail = await rentNFTContract.getItemDetail(
        BigNumber.from(1),
      );

      // wrapped contract detail
      let wrappednft = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[0];

      let testNFTContract = Wrapped__factory.connect(
        wrappednft.wrappedNFT,
        users[3],
      );

      let wrappednft1 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[1];

      let testNFTContract1 = Wrapped__factory.connect(
        wrappednft1.wrappedNFT,
        users[3],
      );

      let wrappednft2 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[2];

      let testNFTContract2 = Wrapped__factory.connect(
        wrappednft2.wrappedNFT,
        users[3],
      );

      let wrappednft3 = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[3];

      let testNFTContract3 = Wrapped__factory.connect(
        wrappednft3.wrappedNFT,
        users[3],
      );

      expect(getItemDetail).to.have.deep.members([
        [
          testNFTContract.address,
          BigNumber.from(endDate1),
          BigNumber.from(endDate),
          BigNumber.from(totalCalculateRent1),
        ],
        [
          testNFTContract1.address,
          BigNumber.from(endDate3),
          BigNumber.from(endDate2),
          BigNumber.from(totalCalculateRent3),
        ],
        [
          testNFTContract2.address,
          BigNumber.from(endDate),
          BigNumber.from(startDate),
          BigNumber.from(totalCalculateRent),
        ],
        [
          testNFTContract3.address,
          BigNumber.from(endDate2),
          BigNumber.from(endDate1),
          BigNumber.from(totalCalculateRent2),
        ],
      ]);
    });

    it("Should check calculate without discount rent for contract owner, and rent commission", async function () {
      const { rentNFTContract, startDate, endDate, users, itemId } =
        await loadFixture(basicMethod);

      let rentcommision = 10;

      let calculateRent = duration0 * rentpersecond;
      let rentcommission = (calculateRent * rentcommision) / 100;

      // add packages
      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      expect(await rentNFTContract.contractBalance()).to.equal(
        BigNumber.from(Math.round(calculateRent)),
      );

      expect(await rentNFTContract.rentCommisionFunds()).to.equal(
        BigNumber.from(Math.round(rentcommission)),
      );
    });

    it("Should check calculate discount rent Commision Funds", async function () {
      const {
        nftContract,
        expiresAfter,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        users,
        deployer,
        itemId,
        startDate,
        endDate,
      } = await loadFixture(basicMethod);

      let rentcommision = 10;

      // add packages
      await addPackage(rentNFTContract, deployer);
      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from(1));

      let calculateRent = duration0 * rentpersecond;
      let ownerCommission = (calculateRent * rentcommision) / 100;
      let getDiscount = (calculateRent * discountinbps[1]) / 100;

      let totalContractBalance = calculateRent - getDiscount;
      let rentcommission = ownerCommission - getDiscount;

      expect(await rentNFTContract.contractBalance()).to.equal(
        BigNumber.from(Math.round(totalContractBalance)),
      );

      expect(await rentNFTContract.rentCommisionFunds()).to.equal(
        BigNumber.from(Math.round(rentcommission)),
      );
    });

    it("Should check Event for Rent Nft", async function () {
      const { rentNFTContract, startDate, endDate, users, itemId } =
        await loadFixture(basicMethod);

      rentpersecond = 3;
      let rentCommission = 10;

      let calculateRent = rentpersecond * duration0;
      let totalCalculateRent =
        calculateRent - (calculateRent * rentCommission) / 100;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from("0"));

      // wrapped contract detail
      let wrappednft = await (
        await rentNFTContract.getItemDetail(BigNumber.from(1))
      )[0];

      let testNFTContract = Wrapped__factory.connect(
        wrappednft.wrappedNFT,
        users[3],
      );

      let getItemDetail = await rentNFTContract.getItemDetail(
        BigNumber.from(1),
      );

      expect(getItemDetail)
        .to.emit(rentNFTContract, "NFTIsRented")
        .withArgs(
          BigNumber.from(itemId),
          testNFTContract.address,
          BigNumber.from(0),
          users[3].address,
          users[1].address,
          totalCalculateRent,
          startDate,
          endDate,
          BigNumber.from(0),
        );
    });

    it("Should check revert method for rent nft", async function () {
      const {
        rentNFTContract,
        users,
        itemId,
        startDate,
        endDate,
        currentTime,
      } = await loadFixture(basicMethod);

      // add packages
      await listNFTForRent(nftID1, rentpersecond);

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(itemId, startDate + startDate, endDate, BigNumber.from(0)),
      ).to.be.reverted;

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(itemId, startDate, endDate * 10, BigNumber.from(0)),
      ).to.be.revertedWith("check max duration");

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(itemId, startDate + 100, endDate, BigNumber.from(0)),
      ).to.be.revertedWith("check min duration");

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(
            itemId,
            startDate + 10000000,
            endDate + 10000000,
            BigNumber.from(0),
          ),
      ).to.be.revertedWith("rent period expired");

      await rentNFTContract
        .connect(users[3])
        .rentNFT(itemId, startDate, endDate, BigNumber.from(0));

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(itemId, startDate, endDate, BigNumber.from(0)),
      ).to.be.revertedWith("already booked for time period");

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(
            itemId,
            currentTime.sub(864000),
            endDate - 864000,
            BigNumber.from(0),
          ),
      ).to.be.revertedWith("Start / End date not valid!");

      await expect(
        rentNFTContract
          .connect(users[3])
          .rentNFT(itemId, endDate, endDate, BigNumber.from(0)),
      ).to.be.reverted;

      //
    });
  });

  describe("List NFT for Sale Method", () => {
    it("Should check for Nft is on Sale", async function () {
      const { rentNFTContract, itemId, users } = await loadFixture(basicMethod);

      let price = 30000;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      expect(
        await rentNFTContract.marketplace(BigNumber.from(itemId)),
      ).to.have.deep.members([
        BigNumber.from(itemId),
        true,
        BigNumber.from(price),
      ]);
    });

    it("Should check Event for Nft is on Sale", async function () {
      const { rentNFTContract, itemId, users } = await loadFixture(basicMethod);

      let price = 30000;

      await listNFTForRent(nftID1, rentpersecond);

      expect(
        await rentNFTContract
          .connect(users[1])
          .listNFTforSale(itemId, price, true),
      )
        .to.emit(rentNFTContract, "listNFTforSaleEvent")
        .withArgs(BigNumber.from(itemId), true, BigNumber.from(price));
    });

    it("Should check Revert Method for NFT on sale", async function () {
      const { rentNFTContract, itemId, users } = await loadFixture(basicMethod);

      let price = 30000;

      await listNFTForRent(nftID1, rentpersecond);

      await expect(
        rentNFTContract.connect(users[2]).listNFTforSale(itemId, price, true),
      ).to.be.revertedWith("only owner can do this action");
    });
  });

  describe("Buy Listed NFT Method", () => {
    it("Should check for buy nft", async function () {
      const {
        nftContract,
        minumumDuration,
        maximumDuration,
        rentNFTContract,
        bestResolution,
        aspectRatio,
        category,
        users,
        itemId,
      } = await loadFixture(basicMethod);

      let price = 30000;
      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      await rentNFTContract.connect(users[3]).buyListedNFT(itemId);

      let nftonrent = await rentNFTContract.allNFT(BigNumber.from(1));
      expect(nftonrent).to.have.deep.members([
        BigNumber.from(nftID1),
        nftContract.address,
        BigNumber.from(nftonrent.expiresAt),
        BigNumber.from(minumumDuration),
        BigNumber.from(maximumDuration),
        BigNumber.from(rentpersecond),
        bestResolution,
        aspectRatio,
        category,
        users[3].address,
        BigNumber.from(0),
      ]);
    });

    it("Should check Remove last marketplace values", async function () {
      const { rentNFTContract, users, itemId } = await loadFixture(basicMethod);

      let price = 30000;
      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      await rentNFTContract.connect(users[3]).buyListedNFT(itemId);

      expect(
        await rentNFTContract.marketplace(BigNumber.from(itemId)),
      ).to.have.deep.members([BigNumber.from(0), false, BigNumber.from(0)]);
    });

    it("Should check nft old owner balance and new owner remaining balance", async function () {
      const { rentNFTContract, blcContract, deployer, users, itemId } =
        await loadFixture(basicMethod);

      let price = 30000;
      let ownerCommision = 10;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      let contractOwner = (price * ownerCommision) / 100;
      let nftOwner = price - contractOwner;

      await rentNFTContract.connect(users[3]).buyListedNFT(itemId);

      expect(await blcContract.balanceOf(users[1].address)).to.equal(
        addDecimal(nftOwner),
      );

      expect(await blcContract.balanceOf(users[3].address)).to.equal(
        subDecimal(price),
      );
    });

    it("Should check amount with drawn by owner", async function () {
      const { rentNFTContract, users, itemId } = await loadFixture(basicMethod);

      let price = 30000;
      let ownerCommision = 10;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      let contractOwner = (price * ownerCommision) / 100;

      await rentNFTContract.connect(users[3]).buyListedNFT(itemId);

      expect(await rentNFTContract.amountWithdrawnByOwner()).to.equal(
        BigNumber.from(contractOwner),
      );
    });

    it("Should check amount with drawn by owner and check contract balance", async function () {
      const { blcContract, rentNFTContract, deployer, users, itemId } =
        await loadFixture(basicMethod);

      let price = 30000;
      let ownerCommision = 10;

      let oldOwnerBalance = await blcContract.balanceOf(deployer.address);

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      let contractOwner = (price * ownerCommision) / 100;

      await rentNFTContract.connect(users[3]).buyListedNFT(itemId);

      expect(await rentNFTContract.amountWithdrawnByOwner()).to.equal(
        BigNumber.from(contractOwner),
      );

      oldOwnerBalance = oldOwnerBalance.add(contractOwner);
      expect(await blcContract.balanceOf(deployer.address)).to.equal(
        BigNumber.from(oldOwnerBalance),
      );
    });

    it("Should check Event for Buy Nft", async function () {
      const { rentNFTContract, itemId, users } = await loadFixture(basicMethod);

      let price = 30000;

      await listNFTForRent(nftID1, rentpersecond);

      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, true);

      await expect(rentNFTContract.connect(users[1]).buyListedNFT(itemId))
        .to.emit(rentNFTContract, "buyListedNFTEvent")
        .withArgs(users[1].address, BigNumber.from(itemId));
    });

    it("Should check Revert Method for Buy NFT", async function () {
      const { rentNFTContract, itemId, users } = await loadFixture(basicMethod);

      let price = 30000;

      await listNFTForRent(nftID1, rentpersecond);
      await rentNFTContract
        .connect(users[1])
        .listNFTforSale(itemId, price, false);

      await expect(
        rentNFTContract.connect(users[3]).buyListedNFT(itemId),
      ).to.be.revertedWith("nft is not on sale");
    });
  });

  describe("Nft All Token Withdrawn Method", () => {
    it("Should check Nft owner can withdrawan token to contract", async function () {
      const {
        nftContract,
        blcContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
        endDate2,
        endDate3,
        extraTime,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID2 = BigNumber.from(2);
      let nftID3 = BigNumber.from(3);
      let nftID4 = BigNumber.from(4);
      let rentcommision = 10;
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }

      // -------------------------------------- end add packages----------------------------------------

      // ------------------------------------------Calculation -------------------------------------------
      // 1st nft owner
      let calculateRent = duration0 * rentpersecond; // get duration amount
      let ownerCommission = (calculateRent * rentcommision) / 100; // get owner amount
      let nftCommission = calculateRent - ownerCommission; // get nft owner amount
      let getDiscount = (calculateRent * discountinbps[2]) / 100; // get give discount to user amount
      ownerCommission = ownerCommission - getDiscount; // get owner remaining balance with discount amount

      let calculateRent1 = duration1 * rentpersecond; // get duration amount
      let ownerCommission1 = (calculateRent1 * rentcommision) / 100; // get owner amount
      let nftCommission1 = calculateRent1 - ownerCommission1; // get nft owner amount
      let getDiscount1 = (calculateRent1 * discountinbps[3]) / 100; // get give discount to user amount
      ownerCommission1 = ownerCommission1 - getDiscount1; // get owner remaining balance with discount amount
      ownerCommission1 = ownerCommission1 + ownerCommission; // add old balance
      nftCommission1 = nftCommission1 + nftCommission; // get nft owner remaining balance

      // 2nd nft owner
      let calculateRent2 = duration2 * rentpersecond; // get duration amount
      let ownerCommission2 = (calculateRent2 * rentcommision) / 100; // get owner amount
      let nftCommission2 = calculateRent2 - ownerCommission2; // get nft owner amount
      let getDiscount2 = (calculateRent2 * discountinbps[4]) / 100; // get give discount to user amount
      ownerCommission2 = ownerCommission2 - getDiscount2; // get owner remaining balance with discount amount
      ownerCommission2 = ownerCommission2 + ownerCommission1; // add old balance
      nftCommission2 = nftCommission2; // get nft owner remaining balance

      let calculateRent3 = duration3 * rentpersecond; // get duration amount
      let ownerCommission3 = (calculateRent3 * rentcommision) / 100; // get owner amount
      let nftCommission3 = calculateRent3 - ownerCommission3; // get nft owner amount
      let getDiscount3 = (calculateRent3 * discountinbps[5]) / 100; // get give discount to user amount
      ownerCommission3 = ownerCommission3 - getDiscount3; // get owner remaining balance with discount amount
      ownerCommission3 = ownerCommission3 + ownerCommission2; // add old balance
      nftCommission3 = nftCommission3 + nftCommission2; // get nft owner remaining balance

      // ------------------------------------------End Calculation -------------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID4,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(3, endDate1, endDate2, BigNumber.from(packageID[4]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(4, endDate2, endDate3, BigNumber.from(packageID[5]));

      //----------------------------------- end take nf on rent ------------------------------------------
      // 1 nft owner balance check
      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      await rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([1]);
      expect(await blcContract.balanceOf(users[1].address)).to.equal(
        addDecimal(nftCommission),
      );

      increaseTime = 3;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      await rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([2]);
      expect(await blcContract.balanceOf(users[1].address)).to.equal(
        addDecimal(nftCommission1),
      );

      // 2 nft owner balance check
      increaseTime = 4;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      await rentNFTContract.connect(users[2]).nftAllTokenWithdrawn([3]);
      expect(await blcContract.balanceOf(users[2].address)).to.equal(
        addDecimal(nftCommission2),
      );

      increaseTime = 5;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      await rentNFTContract.connect(users[2]).nftAllTokenWithdrawn([4]);
      expect(await blcContract.balanceOf(users[2].address)).to.equal(
        addDecimal(nftCommission3),
      );
    });

    it("Should check Nft owner can get nft All Token for nft owners", async function () {
      const {
        nftContract,
        blcContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
        endDate2,
        endDate3,
        extraTime,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID2 = BigNumber.from(2);
      let nftID3 = BigNumber.from(3);
      let nftID4 = BigNumber.from(4);
      let rentcommision = 10;
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }

      // -------------------------------------- end add packages----------------------------------------

      // ------------------------------------------Calculation -------------------------------------------
      // 1st nft owner
      let calculateRent = duration0 * rentpersecond; // get duration amount
      let ownerCommission = (calculateRent * rentcommision) / 100; // get owner amount
      let nftCommission = calculateRent - ownerCommission; // get nft owner amount
      let getDiscount = (calculateRent * discountinbps[2]) / 100; // get give discount to user amount
      ownerCommission = ownerCommission - getDiscount; // get owner remaining balance with discount amount

      let calculateRent1 = duration1 * rentpersecond; // get duration amount
      let ownerCommission1 = (calculateRent1 * rentcommision) / 100; // get owner amount
      let nftCommission1 = calculateRent1 - ownerCommission1; // get nft owner amount
      let getDiscount1 = (calculateRent1 * discountinbps[3]) / 100; // get give discount to user amount
      ownerCommission1 = ownerCommission1 - getDiscount1; // get owner remaining balance with discount amount
      ownerCommission1 = ownerCommission1 + ownerCommission; // add old balance

      // 2nd nft owner
      let calculateRent2 = duration2 * rentpersecond; // get duration amount
      let ownerCommission2 = (calculateRent2 * rentcommision) / 100; // get owner amount
      let nftCommission2 = calculateRent2 - ownerCommission2; // get nft owner amount
      let getDiscount2 = (calculateRent2 * discountinbps[4]) / 100; // get give discount to user amount
      ownerCommission2 = ownerCommission2 - getDiscount2; // get owner remaining balance with discount amount
      ownerCommission2 = ownerCommission2 + ownerCommission1; // add old balance

      let calculateRent3 = duration3 * rentpersecond; // get duration amount
      let ownerCommission3 = (calculateRent3 * rentcommision) / 100; // get owner amount
      let nftCommission3 = calculateRent3 - ownerCommission3; // get nft owner amount
      let getDiscount3 = (calculateRent3 * discountinbps[5]) / 100; // get give discount to user amount
      ownerCommission3 = ownerCommission3 - getDiscount3; // get owner remaining balance with discount amount
      ownerCommission3 = ownerCommission3 + ownerCommission2; // add old balance

      // ------------------------------------------End Calculation -------------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID4,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(3, endDate1, endDate2, BigNumber.from(packageID[4]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(4, endDate2, endDate3, BigNumber.from(packageID[5]));

      //----------------------------------- end take nf on rent ------------------------------------------
      // 1 nft owner balance check
      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.getnftAllToken([1])).to.equal(
        BigNumber.from(nftCommission),
      );

      increaseTime = 3;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.getnftAllToken([2])).to.equal(
        BigNumber.from(nftCommission1),
      );

      // 2 nft owner balance check
      increaseTime = 4;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.getnftAllToken([3])).to.equal(
        BigNumber.from(nftCommission2),
      );

      increaseTime = 5;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.getnftAllToken([4])).to.equal(
        BigNumber.from(nftCommission3),
      );
    });

    it("Should check contract balance after withdrawal nft owner token", async function () {
      const {
        nftContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID3 = BigNumber.from(3);
      let rentcommision = 10;
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }

      // -------------------------------------- end add packages----------------------------------------

      // ------------------------------------------Calculation -------------------------------------------
      // 1st nft owner
      let calculateRent = duration0 * rentpersecond; // get duration amount
      let ownerCommission = (calculateRent * rentcommision) / 100; // get owner amount
      let nftCommission = calculateRent - ownerCommission; // get nft owner amount
      let getDiscount = (calculateRent * discountinbps[2]) / 100; // get give discount to user amount
      ownerCommission = ownerCommission - getDiscount; // get owner remaining balance with discount amount
      let totalContract = ownerCommission + nftCommission; // get total contract balance with owner and nft owner

      // 2st nft owner
      let calculateRent1 = duration1 * rentpersecond; // get duration amount
      let ownerCommission1 = (calculateRent1 * rentcommision) / 100; // get owner amount
      let nftCommission1 = calculateRent1 - ownerCommission1; // get nft owner amount
      let getDiscount1 = (calculateRent1 * discountinbps[3]) / 100; // get give discount to user amount
      ownerCommission1 = ownerCommission1 - getDiscount1; // get owner remaining balance with discount amount
      let totalContract1 = ownerCommission1 + nftCommission1 + totalContract; // get total contract balance with owner and nft owner

      // ------------------------------------------End Calculation -------------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      //----------------------------------- end take nf on rent ------------------------------------------

      expect(await rentNFTContract.contractBalance()).to.equal(
        BigNumber.from(totalContract1),
      );
    });

    it("Should check contract owner balance after withdrawal nft owner token", async function () {
      const {
        nftContract,
        blcContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID3 = BigNumber.from(3);
      let rentcommision = 10;
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }

      // -------------------------------------- end add packages----------------------------------------

      // ------------------------------------------Calculation -------------------------------------------
      // 1st nft owner
      let calculateRent = duration0 * rentpersecond; // get duration amount
      let ownerCommission = (calculateRent * rentcommision) / 100; // get owner amount
      let nftCommission = calculateRent - ownerCommission; // get nft owner amount
      let getDiscount = (calculateRent * discountinbps[2]) / 100; // get give discount to user amount
      ownerCommission = ownerCommission - getDiscount; // get owner remaining balance with discount amount
      let totalContract = ownerCommission + nftCommission; // get total contract balance with owner and nft owner

      // 2st nft owner
      let calculateRent1 = duration1 * rentpersecond; // get duration amount
      let ownerCommission1 = (calculateRent1 * rentcommision) / 100; // get owner amount
      let nftCommission1 = calculateRent1 - ownerCommission1; // get nft owner amount
      let getDiscount1 = (calculateRent1 * discountinbps[3]) / 100; // get give discount to user amount
      ownerCommission1 = ownerCommission1 - getDiscount1; // get owner remaining balance with discount amount
      let totalContract1 = ownerCommission1 + nftCommission1 + totalContract; // get total contract balance with owner and nft owner
      ownerCommission1 = ownerCommission1 + ownerCommission; // add old balance

      // ------------------------------------------End Calculation -------------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      //----------------------------------- end take nf on rent ------------------------------------------

      await rentNFTContract.connect(deployer).withDrawFundsOwner();
      expect(await blcContract.balanceOf(deployer.address)).to.equal(
        BigNumber.from(ownerCommission1),
      );

      // contract Remaining Balance after withdrawal owner token
      expect(await rentNFTContract.contractBalance()).to.equal(
        BigNumber.from(totalContract1).sub(ownerCommission1),
      );
    });

    it("Should check Event for nftAllTokenWithdrawn", async function () {
      const {
        nftContract,
        blcContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
        endDate2,
        endDate3,
        extraTime,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID2 = BigNumber.from(2);
      let nftID3 = BigNumber.from(3);
      let nftID4 = BigNumber.from(4);
      let rentcommision = 10;
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }

      // -------------------------------------- end add packages----------------------------------------

      // ------------------------------------------Calculation -------------------------------------------
      // 1st nft owner
      let calculateRent = duration0 * rentpersecond; // get duration amount
      let ownerCommission = (calculateRent * rentcommision) / 100; // get owner amount
      let nftCommission = calculateRent - ownerCommission; // get nft owner amount
      let getDiscount = (calculateRent * discountinbps[2]) / 100; // get give discount to user amount
      ownerCommission = ownerCommission - getDiscount; // get owner remaining balance with discount amount

      let calculateRent1 = duration1 * rentpersecond; // get duration amount
      let ownerCommission1 = (calculateRent1 * rentcommision) / 100; // get owner amount
      let nftCommission1 = calculateRent1 - ownerCommission1; // get nft owner amount
      let getDiscount1 = (calculateRent1 * discountinbps[3]) / 100; // get give discount to user amount
      ownerCommission1 = ownerCommission1 - getDiscount1; // get owner remaining balance with discount amount
      ownerCommission1 = ownerCommission1 + ownerCommission; // add old balance
      nftCommission1 = nftCommission1 + nftCommission; // get nft owner remaining balance

      // 2nd nft owner
      let calculateRent2 = duration2 * rentpersecond; // get duration amount
      let ownerCommission2 = (calculateRent2 * rentcommision) / 100; // get owner amount
      let nftCommission2 = calculateRent2 - ownerCommission2; // get nft owner amount
      let getDiscount2 = (calculateRent2 * discountinbps[4]) / 100; // get give discount to user amount
      ownerCommission2 = ownerCommission2 - getDiscount2; // get owner remaining balance with discount amount
      ownerCommission2 = ownerCommission2 + ownerCommission1; // add old balance
      nftCommission2 = nftCommission2; // get nft owner remaining balance

      let calculateRent3 = duration3 * rentpersecond; // get duration amount
      let ownerCommission3 = (calculateRent3 * rentcommision) / 100; // get owner amount
      let nftCommission3 = calculateRent3 - ownerCommission3; // get nft owner amount
      let getDiscount3 = (calculateRent3 * discountinbps[5]) / 100; // get give discount to user amount
      ownerCommission3 = ownerCommission3 - getDiscount3; // get owner remaining balance with discount amount
      ownerCommission3 = ownerCommission3 + ownerCommission2; // add old balance
      nftCommission3 = nftCommission3 + nftCommission2; // get nft owner remaining balance

      // ------------------------------------------End Calculation -------------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID2,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID4,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(3, endDate1, endDate2, BigNumber.from(packageID[4]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(4, endDate2, endDate3, BigNumber.from(packageID[5]));

      //----------------------------------- end take nf on rent ------------------------------------------
      // 1 nft owner balance check
      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([1]))
        .to.emit(rentNFTContract, "Withdrawn")
        .withArgs(nftCommission, users[1].address, BigNumber.from(1));

      increaseTime = 3;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([2]))
        .to.emit(rentNFTContract, "Withdrawn")
        .withArgs(
          nftCommission1 - nftCommission,
          users[1].address,
          BigNumber.from(2),
        );

      // 2 nft owner balance check
      increaseTime = 4;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.connect(users[2]).nftAllTokenWithdrawn([3]))
        .to.emit(rentNFTContract, "Withdrawn")
        .withArgs(nftCommission2, users[2].address, BigNumber.from(3));

      increaseTime = 5;
      latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      expect(await rentNFTContract.connect(users[2]).nftAllTokenWithdrawn([4]))
        .to.emit(rentNFTContract, "Withdrawn")
        .withArgs(
          nftCommission3 - nftCommission2,
          users[2].address,
          BigNumber.from(4),
        );
    });

    it("Should check revert message for nft owner withdrawal token ", async function () {
      const {
        nftContract,
        rentNFTContract,
        minumumDuration,
        maximumDuration,
        bestResolution,
        aspectRatio,
        category,
        deployer,
        users,
        startDate,
        endDate,
        endDate1,
        extraTime,
      } = await loadFixture(basicMethod);

      let day = 24 * 60 * 60;
      let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

      let expiresAfter = currentTime.add(10 * day);
      let nftID1 = BigNumber.from(1);
      let nftID3 = BigNumber.from(3);
      let packageID = [0, 1, 2, 3, 4, 5];
      let discountinbps = [0, 2, 4, 6, 8, 9];

      let _requiredtime = "86400";

      // --------------------------------------add packages---------------------------------------------
      for (let i = 1; i < packageID.length; i++) {
        await rentNFTContract
          .connect(deployer)
          ._addUpdatepackage(_requiredtime, discountinbps[i], packageID[i]);
      }
      // -------------------------------------- end add packages----------------------------------------

      //--------------------------------------- nft owner provide on nft rent ------------------------------

      await rentNFTContract
        .connect(users[1])
        .listNFTForRent(
          nftID1,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      await rentNFTContract
        .connect(users[2])
        .listNFTForRent(
          nftID3,
          nftContract.address,
          expiresAfter,
          minumumDuration,
          maximumDuration,
          rentpersecond,
          bestResolution,
          aspectRatio,
          category,
        );

      //--------------------------------end nft owner provide on nft rent ------------------------------

      //--------------------------------------------- provide nft on rent ------------------------------------

      await rentNFTContract
        .connect(users[3])
        .rentNFT(1, startDate, endDate, BigNumber.from(packageID[2]));

      await rentNFTContract
        .connect(users[3])
        .rentNFT(2, endDate, endDate1, BigNumber.from(packageID[3]));

      //----------------------------------- end take nf on rent ------------------------------------------
      // 1 nft owner balance check
      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + extraTime));
      await rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([1]);
      await expect(
        rentNFTContract.connect(users[2]).nftAllTokenWithdrawn([1]),
      ).to.be.revertedWith("only owner can do this action");

      await expect(
        rentNFTContract.connect(users[1]).nftAllTokenWithdrawn([2]),
      ).to.be.revertedWith("only owner can do this action");
    });
  });
});
