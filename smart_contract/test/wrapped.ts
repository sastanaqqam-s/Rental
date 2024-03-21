import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { exit } from "process";

import { Wrapped__factory } from "../typechain";

import { basicMethod } from "./fixture/index";

let day = 24 * 60 * 60;
let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

describe("Wrapped Contract", () => {
  beforeEach(async () => {
    let increaseTime = 2;
    let latestTime = BigNumber.from(await time.latest());
    await time.increaseTo(latestTime.add(increaseTime * day + 20));
  });

  describe("Basic Wrapped ERC-721 Token Testing", () => {
    it("should check token name ", async () => {
      const { wrappedContract, deployer } = await loadFixture(basicMethod);
      expect(await wrappedContract.name()).to.be.equal("Sastana NFT");
    });

    it("should check token symbol ", async () => {
      const { wrappedContract, deployer } = await loadFixture(basicMethod);
      expect(await wrappedContract.symbol()).to.be.equal("Sastarent");
    });

    it("should check nft mint by contract address", async () => {
      const { wrappedContract, users } = await loadFixture(basicMethod);

      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + 200000));

      expect(await wrappedContract.ownerOf(1)).to.be.equal(users[1].address);
    });

    it("should check balance Of method with if condition", async () => {
      const { wrappedContract, users } = await loadFixture(basicMethod);

      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + 20));

      expect(await wrappedContract.balanceOf(users[1].address)).to.be.equal(
        BigNumber.from(1),
      );
    });

    it("should check balance Of method with if condition", async () => {
      const { wrappedContract, users } = await loadFixture(basicMethod);

      expect(await wrappedContract.balanceOf(users[1].address)).to.be.equal(
        BigNumber.from(0),
      );
    });

    it("should check nft token uri", async () => {
      const { wrappedContract, deployer, tokenUri1 } = await loadFixture(
        basicMethod,
      );

      let increaseTime = 2;
      let latestTime = BigNumber.from(await time.latest());
      await time.increaseTo(latestTime.add(increaseTime * day + 200000));

      expect(await wrappedContract.tokenURI(1)).to.be.equal(tokenUri1);
    });

    it("should check Start and End Date", async () => {
      const { wrappedContract, startDate, endDate3, tokenUri1 } =
        await loadFixture(basicMethod);

      expect(await wrappedContract.startAt()).to.be.equal(startDate);
      expect(await wrappedContract.expireAt()).to.be.equal(endDate3);
    });

    it("should check updated startDate", async () => {
      const { wrappedContract, endDate3 } = await loadFixture(basicMethod);

      await wrappedContract._setStartAt(endDate3);

      expect(await wrappedContract.startAt()).to.be.equal(endDate3);
    });

    it("should check updated endDate", async () => {
      const { wrappedContract, endDate2 } = await loadFixture(basicMethod);

      await wrappedContract._setExpireAt(endDate2);

      expect(await wrappedContract.expireAt()).to.be.equal(endDate2);
    });

    it("should check updated Token URI", async () => {
      const { wrappedContract, tokenUri2 } = await loadFixture(basicMethod);

      await wrappedContract._setTokenURIWrapped(tokenUri2);

      expect(await wrappedContract.URI()).to.be.equal(tokenUri2);
    });

    it("should check not active uri", async () => {
      const { wrappedContract, startDate } = await loadFixture(basicMethod);

      await wrappedContract._setExpireAt(startDate);

      expect(await wrappedContract.tokenURI(1)).to.be.equal(
        "rent not started uri",
      );
    });

    it("should check Owner Of method with else condition", async () => {
      const { wrappedContract, startDate } = await loadFixture(basicMethod);

      await wrappedContract._setExpireAt(startDate);

      expect(await wrappedContract.ownerOf(1)).to.be.equal(BigNumber.from(0));
    });

    it("should check Transfer Wrapped NFT", async () => {
      const { wrappedContract, users } = await loadFixture(basicMethod);

      await expect(
        wrappedContract.transferFrom(users[1].address, users[2].address, 1),
      ).to.revertedWith("NFT Not use Again, Already Used in Sastana Art!");
    });
  });
});
