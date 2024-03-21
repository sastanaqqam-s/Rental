# Advanced Sample Hardhat Project

<!-- Deployment Step -->

## Installation and Setup Instructions

### If you want to set up the hardhat through Clone: follow these steps-

<b> Install All Packages: </b>

    npm install --save

---

### Make sure to update your Hardhat configuration and create a .env file, You can refer to the example .env file provided and make the necessary updates to your own .env file and the Hardhat configuration file based on your network specifications.

<b> Create & Configure .env file: </b>
Make a copy of env_example named .env.

    cp env_example .env

You can also modify any of the optional environment variables if you'd wish, but the defaults should work perfectly well.

---

### Hardhat Config

In `hardhat.config.ts` file add network with basic some parameter like set url(your network url api key) and private key(which you are using to deploy and verify your smart contract).

Then, Set `ETHERSCAN API KEY`.

#### ETHERSCAN_API_KEY

You will get the ETHERSCAN API KEY from etherscan.io, for which you need to log in to etherscan.io. After logging in, go to the "https://etherscan.io/myapikey" website and create your API key there.

#### ALCHEMY_GOERLI_API_KEY

You can get the ALCHEMY GOERLI API KEY either from Alchemy or create it from Infura. You have the option to create an API key from Alchemy based on your network preferences by visiting https://dashboard.alchemy.com/. Moreover, you can also use Alchemy's "faucet" feature to get test Ether for your Goerli network or other network.

PRIVATE_KEY : You can obtain your private key from your public address in MetaMask.

#### Then, Test your Smart contract

    npx hardhat clean

    npx hardhat compile

    npx hardhat test

    npx hardhat coverage

<b> After Successfully run test case you can use this network setup as per need <b>

---

<!-- In proxy deploymentation -->

# Deploy Proxy Contract Steps

Step 1: Change ERC20 Fee Token to BLUE Token Address then, deploy proxy-deploy.ts file using command -> npx hardhat run --network polygon_mumbai scripts/proxy-deploy.ts

## Output: get 2 contract address (i) Blc contract, (ii) Proxy contract

Step 2: Verify RentNft proxy contract using command. npx hardhat verify --network polygon_mumbai 0x837d17775945a3d5643Ac1d09C4892BA25B6F212 {// Proxy contract}.

## Output: get (i) Proxy Admin Contract address, (ii) Verified Rent Contract address, with (iii) Proxy Address

<!-----------------------

   Upgrade Contract

------------------------>

Step 3: Change any methods name and upgrade contract using command: npx hardhat run --network polygon_mumbai scripts/upgrade-proxy-deploy.ts

## Upgrate process: Use proxy contract and hit diffrent upgrade methods

1. comment (prepareUpgrade,upgradeProxy) uncomment forceImport
2. comment (forceImport,upgradeProxy) uncomment prepareUpgrade
3. comment (prepareUpgrade,forceImport) uncomment upgradeProxy

## Output: provide successfull upgrade message

Step 4: Again Verify RentNft proxy contract using command. npx hardhat verify --network polygon_mumbai 0x837d17775945a3d5643Ac1d09C4892BA25B6F212 {// Proxy contract}.

## Output: provide successfull verify message

---

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).

Do you know how we can get NFT Artwork from Metmask ?
Like if user wants to Rent a NFT Then :

1. He will connect his/her wallet to our website.
2. With Web3.js or something we will pull all his NFT available for Rent and Display them to our UI.
3. User select any particular NFT and Proceed for Rent ..

4. Once Metamask is connected you can query tokenURI() of NFT to get NFT artwork
5. To put NFT on rent check listNFTForRent method mentioned below
6. If user want NFT on rent check rentNFT() method mentioned below

---

1. List NFT for rent (by nft owner)
2. Rent NFT (By NFT renter)
3. unlist NFT (By nft owner)

4. listNFTForRent(
   uint8 \_nftID,
   address \_nftAddress,
   uint256 \_expiresAfter
   )
   i) \_nftID :- nftid of native NFT which has to be listed
   ii) \_nftAddress: NFT collection address
   iii) unix timestamp for expire duration

Called ny NFT owner who want to list his NFT for rent
Owner has to approve NFT prior to that

2. unlistNFTForRent(uint8 \_nftID, address \_nftAddress)
   i) \_nftID :- nftid of native NFT which has to be unlisted
   ii) \_nftAddress: NFT collection address

Called my NFT owner who want to unlist his NFT for rent, it will unlist real NFT back to owner address, it will fail if NFT is still on rent

3. rentNFT(
   uint8 \_itemID,
   uint256 \_startAt,
   uint256 \_endAt
   )

   i) uint8 \_itemID: itemid to take as rent
   ii) uint256 \_startAt, unix timestamp from which rent duration will start
   iii) uint256 \_endAt, unix timestamp from which rent duration will end, it should be less that \_expiresAfter of itemid

called by rentee to take nft on rent, use has to approve fee token prior to that

4. totalInventory(): number of NFT listed on marketplace

5. rentedindex(uint8 itemid,uint8 rentedindex ) get details of rented reciept, and wrapped NFT address

6. allNFT(uint8 itemid) : returns detail of NFT in inventory,
