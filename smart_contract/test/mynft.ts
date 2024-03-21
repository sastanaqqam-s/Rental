import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { exit } from "process";

import { basicMethod } from "./fixture/index";

describe("ERC-721 Token Contract", () => {
  describe("Basic ERC-721 Token Testing", () => {
    it("should check token name ", async () => {
      let { nftContract } = await loadFixture(basicMethod);
      expect(await nftContract.name()).to.be.equal("Sastana NFT");
    });

    it("should check token symbol ", async () => {
      const { nftContract } = await loadFixture(basicMethod);
      expect(await nftContract.symbol()).to.be.equal("Sastarent");
    });

    it("should check nft mint by wallet address", async () => {
      const { nftContract, users } = await loadFixture(basicMethod);

      expect(await nftContract.balanceOf(users[1].address)).to.be.equal(
        BigNumber.from(2)
      );

      expect(await nftContract.balanceOf(users[2].address)).to.be.equal(
        BigNumber.from(2)
      );
    });

    it("should check nft mint by contract address", async () => {
      const { nftContract, users } = await loadFixture(basicMethod);

      expect(await nftContract.ownerOf(1)).to.be.equal(users[1].address);
      expect(await nftContract.ownerOf(2)).to.be.equal(users[1].address);
      expect(await nftContract.ownerOf(3)).to.be.equal(users[2].address);
      expect(await nftContract.ownerOf(4)).to.be.equal(users[2].address);
    });

    it("should check nft token uri", async () => {
      const { nftContract, users, tokenUri1, tokenUri2, tokenUri3, tokenUri4 } =
        await loadFixture(basicMethod);

      expect(await nftContract.tokenURI(1)).to.be.equal(tokenUri1);
      expect(await nftContract.tokenURI(2)).to.be.equal(tokenUri2);
      expect(await nftContract.tokenURI(3)).to.be.equal(tokenUri3);
      expect(await nftContract.tokenURI(4)).to.be.equal(tokenUri4);
    });

    it("should check all working transfer amount or not", async () => {
      const { nftContract, users } = await loadFixture(basicMethod);

      await nftContract
        .connect(users[1])
        .transferFrom(users[1].address, users[3].address, 1);

      expect(await nftContract.balanceOf(users[1].address)).to.be.equal(
        BigNumber.from(1)
      );
      expect(await nftContract.balanceOf(users[3].address)).to.be.equal(1);
    });
  });
});
