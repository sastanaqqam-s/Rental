// scripts/deploy_upgradeable_box.js
import hre, { ethers, upgrades } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("RentNFT");
  let erc20feetoken = "0xF576eAE985F9fc2DC171e25b8Ede6653632DA013";

  console.log("Deploying RentNFT...");
  const token = await upgrades.deployProxy(Token, [erc20feetoken], {
    initializer: "initialize",
  });

  await token.deployed();
  console.log("erc20feetoken", erc20feetoken);
  console.log("Proxy deployed to:", token.address);
}

main();

/*
  erc20feetoken 0xF576eAE985F9fc2DC171e25b8Ede6653632DA013
  RentNFT deployed to: 0xf2E64714fC74D423092c2710aF9E2d4ED045709B

  Verifying proxy admin: 0x3ac9EB5BA3D5AEcf2C6000a8D28257dA17D066E3

New
  erc20feetoken: 
  RentNFT deployed to: 
  Verifying proxy admin: 

*/
