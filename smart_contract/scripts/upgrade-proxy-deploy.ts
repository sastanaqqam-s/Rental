import { ethers, upgrades } from "hardhat";

async function main() {
  const BoxV2 = await ethers.getContractFactory("RentNFT");
  console.log("Upgrading RentNFT...");
  // await upgrades.forceImport(
  // await upgrades.prepareUpgrade(
  await upgrades.upgradeProxy(
    "0xf2E64714fC74D423092c2710aF9E2d4ED045709B",
    BoxV2
  );
  console.log("RentNFT upgraded");
}

main();
