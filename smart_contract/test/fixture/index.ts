import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import {
  MyNFT__factory,
  BLCToken__factory,
  RentNFT__factory,
  NFTInventory__factory,
  Wrapped__factory,
} from "../../typechain";

let day = 24 * 60 * 60;
let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

export async function basicMethod() {
  /*

    Basic value Define Used in Contract

  */
  const [deployer, ...users] = await ethers.getSigners();

  let bestResolution = "128*122";
  let aspectRatio = "1:3";
  let category = "Testing NFT";
  let expiresAfter = currentTime.add(100 * day); ///100day->> 8640000s
  let openforrent = true;
  let minumumDuration = 1 * day;
  let maximumDuration = 10 * day;
  let rentpersecond = 1;
  let rentcollected = 0;
  let extraTime = 20;

  let startDate = Math.floor(Date.now() / 1000) + 86400 * 1;
  let endDate = Math.floor(Date.now() / 1000) + 86400 * 2;
  let endDate1 = Math.floor(Date.now() / 1000) + 86400 * 3;
  let endDate2 = Math.floor(Date.now() / 1000) + 86400 * 4;
  let endDate3 = Math.floor(Date.now() / 1000) + 86400 * 5;

  let itemId = BigNumber.from(1);

  const tokenUri1 =
    "https://gateway.pinata.cloud/ipfs/QmVRrkXzbQuMsAKxYnKGNc6CAuxk2x5S4gWqdt2nua3Ziu";

  const tokenUri2 =
    "https://gateway.pinata.cloud/ipfs/QmSJQm4GKSkfycWh54R2GCwXiHrHHWYvE9iGteRrT9FggK";

  const tokenUri3 =
    "https://gateway.pinata.cloud/ipfs/QmXjAJohSiYcLjapAYQLgypNTs7PceVd5o4jUwfTRdvkVj";

  const tokenUri4 =
    "https://gateway.pinata.cloud/ipfs/Qmd74hmRTpCv3hiKXmBALJJZjtDhanFgP1RRZVVmk3xd9r";

  /*
   

    Contract Deployment Code


  */

  // NFT contract deployment
  let nftContract = await (
    await new MyNFT__factory(deployer).deploy()
  ).deployed();

  // BLC contract deployment
  let blcContract = await (
    await new BLCToken__factory(deployer).deploy()
  ).deployed();
  let newBlcContract = await (
    await new BLCToken__factory(deployer).deploy()
  ).deployed();

  // Rent contract deployment
  let rentNFTContract = await upgrades.deployProxy(
    new RentNFT__factory(deployer),
    [blcContract.address],
    {
      initializer: "initialize",
    },
  );

  // Inventory contract deployment
  let inventoryContract = await (
    await new NFTInventory__factory(deployer).deploy()
  ).deployed();

  let wrappedContract = await (
    await new Wrapped__factory(deployer).deploy()
  ).deployed();

  await wrappedContract.initialize(
    endDate3,
    startDate,
    "Sastana NFT",
    "Sastarent",
    tokenUri1,
    users[1].address,
    1,
  );

  /*
  
    
    Mint NFT's And BLC Token's 


  */

  // mint nft to user-1 and user-2 wallet by default
  await nftContract.mint(users[1].address, tokenUri1);
  await nftContract.mint(users[1].address, tokenUri2);

  await nftContract.mint(users[2].address, tokenUri3);
  await nftContract.mint(users[2].address, tokenUri4);

  for (let i = 1; i <= 6; i++) {
    // in nft contract approve rent contract
    await nftContract
      .connect(users[i])
      .setApprovalForAll(rentNFTContract.address, true);

    // in nft contract approve rent contract
    await blcContract.mint(users[i].address, decimal(1000000));
    await blcContract
      .connect(users[i])
      .approve(
        rentNFTContract.address,
        BigNumber.from("1000000000000000000000"),
      );
  }

  return {
    deployer,
    users,
    bestResolution,
    aspectRatio,
    category,
    expiresAfter,
    openforrent,
    minumumDuration,
    maximumDuration,
    rentpersecond,
    rentcollected,
    extraTime,
    startDate,
    endDate,
    endDate1,
    endDate2,
    endDate3,
    itemId,

    tokenUri1,
    tokenUri2,
    tokenUri3,
    tokenUri4,

    nftContract,
    blcContract,
    newBlcContract,
    rentNFTContract,
    inventoryContract,
    wrappedContract,

    currentTime,
  };
}

function decimal(value: any) {
  const powValue = BigNumber.from("10").pow(18);
  return BigNumber.from(value).mul(powValue);
}
