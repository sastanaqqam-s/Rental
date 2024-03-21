import { ethers } from "hardhat";

async function main() {
  const RentNFT = await ethers.getContractFactory("MyNFT");
  const rentnft = await RentNFT.deploy();

  await rentnft.deployed();

  console.log("testNFT deployed to:", rentnft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// polygon network nft contract: 0x6269680F3A8fA4f5f99751B0c13890dD76641679
