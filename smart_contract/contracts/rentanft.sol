//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./wrapped.sol";
import "./test/BLCToken.sol";
import "hardhat/console.sol";

import {NFTInventory, Inventory} from "./inventory.sol";

// =======================================================================================================
//                                        Start All Structure Section
//
// Package: Store discount value with certain time.
// NFTRented: Store Nft renting start and end time with with wrapped nft contract address.
// NFTRentParams: Store Renting start end time with package.
// NFTInventoryMarketPlace: Store Nft price and pass is provided on sale or not.

struct Package {
    uint256 requiredtime;
    uint256 discountinbps;
}

struct NFTRented {
    wrapped wrappedNFT;
    uint256 endAt;
    uint256 startAt;
    uint256 rentAmount;
}

struct NFTRentParams {
    uint8 _itemID;
    uint256 _startAt;
    uint256 _endAt;
    uint256 _packageID;
}

struct NFTInventoryMarketPlace {
    uint256 itemId;
    bool onSale;
    uint256 price;
}

//                                          End All Strucute Section
// =======================================================================================================
//

// contract RentNFT is ReentrancyGuard {
contract RentNFT is Initializable {
    bool private _notEntered;

    // =======================================================================================================
    //                                          Start All Events Section
    //
    // addUpdatepackage: get packageid, requiredtime, discountinbps to get which package add or update.
    // NFTListed: get nft contract detail which are store on this contract.
    // NFTUNListed: get which nft is transfer form contract to nft owner.
    // NFTIsRented: get which nft is rented on which time.
    // listNFTforSaleEvent: get which nft goes on rent and is on rent or not.
    // buyListedNFTEvent: get which nft is buyied by user
    // Withdrawn: get how much amount withdrawn by nft owner / contract owner.

    // get packageid, requiredtime, discountinbps to get which package add or update.
    event addUpdatepackage(
        uint256 packageid,
        uint256 requiredtime,
        uint256 discountinbps
    );

    // get nft contract detail which are store on this contract.
    event NFTListed(
        uint8 nftID,
        address nftAddress,
        uint256 expiresAfter,
        uint256 minumumDuration,
        uint256 maximumDuration,
        string bestResolution,
        string aspectRatio,
        string category,
        uint256 itemid,
        address owner,
        uint256 rentpersecond
    );

    // get which nft is transfer form contract to nft owner.
    event NFTUNListed(uint8 itemid);

    // get which nft is rented on which time.
    event NFTIsRented(
        uint8 itemid,
        wrapped wrappedNFT,
        uint256 discount,
        address rentedBY,
        address nftOwner,
        uint256 rentpaid,
        uint256 startTime,
        uint256 endTime,
        uint256 packageID
    );

    // get which nft goes on rent and is on rent or not.
    event listNFTforSaleEvent(uint256 itemID, uint256 price, bool onSale);

    // get which nft is buyied by user
    event buyListedNFTEvent(address owner, uint256 itemId);

    // get how much amount withdrawn by nft owner / contract owner.
    event Withdrawn(uint256 amount, address by, uint256 itemid);

    //                                         End All Events Section
    // =======================================================================================================

    // get contract current owner
    address public owner;

    // take some commission of nft when it is on rent
    uint256 public rentCommision;

    // take some commission of nft when it user buy nft
    uint256 public buySellCommision;

    // get total commision collect by owner for rent section
    uint256 public rentCommisionFunds;

    // get total amount withdrawan by owner with buying and on renting
    uint256 public amountWithdrawnByOwner;

    // get and store token address and do transactions
    using SafeERC20 for BLCToken;
    BLCToken public feetoken;

    // get inventory contract method and used in this contract
    NFTInventory private inventoryinstance;

    // creating or generate nft token
    address erc721tokenImplementation;

    // =======================================================================================================
    //                                        Start All Mapping Section
    //
    // packages: manage discount value with certain time.
    // rentedindex: manage Nft renting start and end time with with wrapped nft contract address.
    // marketplace: manage Nft price and pass is provided on sale or not.

    mapping(uint256 => Package) public packages;
    mapping(uint256 => NFTRented[]) rentedindex;
    mapping(uint256 => NFTInventoryMarketPlace) public marketplace;

    //                                         End All Mapping Section
    // =======================================================================================================

    function initialize(BLCToken _feetoken) public initializer {
        require(owner == address(0), "Already initalized");
        // set owner address before contract deploy
        owner = msg.sender;

        // set wrapped nft contract address
        erc721tokenImplementation = address(new wrapped());

        // set erc-20 token contrac addess
        feetoken = _feetoken;

        // set rent commision
        rentCommision = 10;

        // set buy sell commision
        buySellCommision = 10;

        // set inventory contract instance for using methods of invetory contract
        inventoryinstance = new NFTInventory();

        _notEntered = true;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * If you mark a function `nonReentrant`, you should also
     * mark it `external`. Calling one nonReentrant function from
     * another is not supported. Instead, you can implement a
     * `private` function doing the actual work, and a `external`
     * wrapper marked as `nonReentrant`.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_notEntered, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _notEntered = false;

        // Yield control to the modified function
        _;

        // Resume nonReentrant state
        _notEntered = true;
    }

    // check only contract owner can access some methods
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this action!");
        _;
    }

    // =======================================================================================================
    //                                  Start Add / Write methods
    //
    // buyListedNFT: Buy nft through nft through item id.
    // listNFTForRent: Provide Nft on rent.
    // listNFTforSale: Provide Nft on Sell.
    // nftAllTokenWithdrawn: Withdrawal tokens for single nft owner.
    // rentNFT: User can borrow nft on rent for certain duration.
    // rentNFTMultiple: User can borrow nft on rent for multiple duration.
    // unlistNFTForRent: Get back Nft by nft owner.
    // _addUpdatepackage: Adding or updating Packages discount.
    // changeBuySellCommision: Set new Buy Sell Commision
    // changeContractOwner: Set new Contract Owner
    // changeFeetoken: Set new Feetoken
    // changeRentCommision: Set new Rent Commision
    // withDrawFundsOwner: Get back token by owner for current contract.

    // Buy nft through nft through item id.
    function buyListedNFT(uint256 _itemID) external nonReentrant {
        Inventory memory nftinventory = inventoryinstance.get(_itemID);

        NFTInventoryMarketPlace memory inventorymarketplace = marketplace[
            _itemID
        ];
        require(inventorymarketplace.onSale == true, "nft is not on sale");

        // calculate contract owner commission
        uint256 ownerCommision = (inventorymarketplace.price *
            buySellCommision) / 100;

        // calculate nft owner commission
        uint256 nftOwnerRemain = inventorymarketplace.price - ownerCommision;

        amountWithdrawnByOwner += ownerCommision;

        // transfer tokens to owner
        feetoken.safeTransferFrom(msg.sender, owner, ownerCommision);

        // transfer tokens to nft owner
        feetoken.safeTransferFrom(
            msg.sender,
            nftinventory.owner,
            nftOwnerRemain
        );

        // update nft new owner
        nftinventory.owner = msg.sender;

        inventoryinstance.update(nftinventory, _itemID);

        // delete marketplace entry after all state changes
        delete marketplace[_itemID];

        emit buyListedNFTEvent(msg.sender, _itemID);
    }

    // Provide Nft on rent.
    function listNFTForRent(
        uint8 _nftID,
        address _nftAddress,
        uint256 _expiresAfter,
        uint256 _minumumDuration,
        uint256 _maximumDuration,
        uint256 _rentpersecond,
        string memory _bestResolution,
        string memory _aspectRatio,
        string memory _category
    ) external {
        uint256 itemID;
        uint256 rentpersecond = _rentpersecond;

        // store nft to this contract
        {
            itemID = inventoryinstance.add(
                _nftID,
                _nftAddress,
                _expiresAfter,
                _minumumDuration,
                _maximumDuration,
                rentpersecond,
                0,
                msg.sender,
                _bestResolution,
                _aspectRatio,
                _category
            );
        }
        emit NFTListed(
            _nftID,
            _nftAddress,
            _expiresAfter,
            _minumumDuration,
            _maximumDuration,
            _bestResolution,
            _aspectRatio,
            _category,
            itemID,
            msg.sender,
            rentpersecond
        );

        // transfer nft to contract by nft owner
        ERC721(_nftAddress).safeTransferFrom(msg.sender, address(this), _nftID);
    }

    // Provide Nft on Sell.
    function listNFTforSale(
        uint256 _itemID,
        uint256 price,
        bool onSale
    ) external nonReentrant {
        Inventory memory nftinventory = inventoryinstance.get(_itemID);
        require(
            msg.sender == nftinventory.owner,
            "only owner can do this action"
        );

        NFTInventoryMarketPlace
            memory inventorymarketplace = NFTInventoryMarketPlace({
                itemId: _itemID,
                onSale: onSale,
                price: price
            });

        marketplace[_itemID] = inventorymarketplace;

        emit listNFTforSaleEvent(_itemID, price, onSale);
    }

    // Withdrawal tokens for single nft owner.
    function nftAllTokenWithdrawn(
        uint256[] memory _itemId
    ) external nonReentrant {
        for (uint256 i = 0; i < _itemId.length; ) {
            Inventory memory nftinventory = inventoryinstance.get(_itemId[i]);
            require(
                msg.sender == nftinventory.owner,
                "only owner can do this action"
            );

            uint256 rentLeft = getnftAllToken(_itemId[i]);

            if (rentLeft > 0) {
                inventoryinstance.updateRentWithdrawn(
                    _itemId[i],
                    inventoryinstance.getRentWithdrawn(_itemId[i]) + rentLeft
                );

                // transfer token to nft owner wallet
                feetoken.safeTransfer(msg.sender, rentLeft);
                emit Withdrawn(rentLeft, address(msg.sender), _itemId[i]);
            }

            unchecked {
                i++;
            }
        }
    }

    // User can borrow nft on rent for certain duration.
    function rentNFT(
        uint8 _itemID,
        uint256 _startAt,
        uint256 _endAt,
        uint256 _packageID
    ) external {
        rentnftinternal(_itemID, _startAt, _endAt, _packageID);
    }

    // User can borrow nft on rent for multiple duration.
    function rentNFTMultiple(NFTRentParams[] memory param) external {
        for (uint256 i = 0; i < param.length; ) {
            rentnftinternal(
                param[i]._itemID,
                param[i]._startAt,
                param[i]._endAt,
                param[i]._packageID
            );
            unchecked {
                i++;
            }
        }
    }

    // Get back Nft by nft owner.
    function unlistNFTForRent(uint8 _itemID) external {
        require(unlistedNFTCheck(_itemID), "already booked for future period");
        Inventory memory nftdetail = inventoryinstance.get(_itemID);

        require(msg.sender == nftdetail.owner, "only owner can unlist");

        emit NFTUNListed(_itemID);

        ERC721(nftdetail.collectionAddress).safeTransferFrom(
            address(this),
            msg.sender,
            nftdetail.nftID
        );
    }

    // --------------------------------------------------------------------------------------------------
    //                                  Only Owner Methods

    // Adding or updating Packages discount.
    function _addUpdatepackage(
        uint256 _requiredtime,
        uint256 discountinbps,
        uint256 packagageID
    ) public onlyOwner {
        require(packagageID > 0, "zero package id is reserved!");
        packages[packagageID] = Package({
            requiredtime: _requiredtime,
            discountinbps: discountinbps
        });

        emit addUpdatepackage(packagageID, _requiredtime, discountinbps);
    }

    // Set new Buy Sell Commision
    function changeBuySellCommision(
        uint256 _buySellCommision
    ) external onlyOwner {
        buySellCommision = _buySellCommision;
    }

    // Set new Contract Owner
    function changeContractOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    // Set new Feetoken
    function changeFeetoken(BLCToken _feeToken) external onlyOwner {
        feetoken = _feeToken;
    }

    // Set new Rent Commision
    function changeRentCommision(uint256 _rentCommision) external onlyOwner {
        rentCommision = _rentCommision;
    }

    // Get back token by owner for current contract.
    // function withDrawFundsOwner() external onlyOwner nonReentrant {
    function withDrawFundsOwner() external onlyOwner nonReentrant {
        uint256 ownerFund = rentCommisionFunds;
        amountWithdrawnByOwner += ownerFund;

        rentCommisionFunds = 0;
        feetoken.safeTransfer(msg.sender, ownerFund);
        emit Withdrawn(ownerFund, address(msg.sender), 0);
    }

    //                                       End Add / Write methods
    // =======================================================================================================

    // =======================================================================================================
    //                                     Start Add Get / Read methods
    //
    // allNFT: get single nft all detail through item id.
    // calculateRent: get total token quantity through start to end time.
    // contractBalance: get total token stored in a contract.
    // getItemDetail: get rent duration and tokens through item id.
    // getnftAllToken: get single item id tokens quantity.
    // onERC721Received: return byte code for wrapped address.
    // totalInventory: get total nft or items stored in contract.
    // unlistedNFTCheck: check nft is unlisted or not.

    // get single nft all detail through item id.
    function allNFT(uint256 itemID) external view returns (Inventory memory) {
        return inventoryinstance.get(itemID);
    }

    // get total token quantity through start to end time.
    function calculateRent(
        uint8 _itemID,
        uint256 duration
    ) public view returns (uint256) {
        uint256 rent = duration * inventoryinstance.get(_itemID).rentpersecond;
        return rent;
    }

    // get total token stored in a contract.
    function contractBalance() public view returns (uint256) {
        return feetoken.balanceOf(address(this));
    }

    // get rent duration and tokens through item id.
    function getItemDetail(
        uint256 _itemID
    ) public view returns (NFTRented[] memory rented) {
        return rentedindex[_itemID];
    }

    // get single item id tokens quantity.
    function getnftAllToken(uint256 _itemID) public view returns (uint256) {
        NFTRented[] memory rentArray = rentedindex[_itemID];
        uint256 rent;
        for (uint256 i = 0; i < rentArray.length; ) {
            if (block.timestamp > rentArray[i].endAt) {
                rent += rentArray[i].rentAmount;
            }
            unchecked {
                i++;
            }
        }

        return (rent - inventoryinstance.getRentWithdrawn(_itemID));
    }

    // return byte code for wrapped address.
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public pure returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    // get total nft or items stored in contract.
    function totalInventory() public view returns (uint256) {
        return inventoryinstance.getLastID();
    }

    // check nft is unlisted or not.
    function unlistedNFTCheck(uint8 _itemID) public view returns (bool) {
        bool unlist = isavailableforrent(
            _itemID,
            block.timestamp,
            2 ** 256 - 1
        );
        return unlist;
    }

    //                                      End Get / Read methods
    // =======================================================================================================

    // =======================================================================================================
    //                                   Start Internal Private methods
    //
    // rentnftinternal: store renting detail with durations and calculate owner and nft owner commission.
    // addRentedNFT: store renting detail with durations
    // isavailableforrent: check nft is available on rent for define duration.
    // calculateDiscountCommisionFund: calculate owner and nft owner commission

    // store renting detail with durations and calculate owner and nft owner commission.
    function rentnftinternal(
        uint8 _itemID,
        uint256 _startAt,
        uint256 _endAt,
        uint256 _packageID // ) private nonReentrant {
    ) private nonReentrant {
        // calculate duration
        uint256 duration = _endAt - _startAt;

        Inventory memory nftdetail = inventoryinstance.get(_itemID);

        if (_packageID == 0) {
            require(
                nftdetail.maximumDuration >= duration,
                "check max duration"
            );
            require(
                nftdetail.minumumDuration <= duration,
                "check min duration"
            );
        }

        // check lend nft is expired or not
        require(nftdetail.expiresAt > _endAt, "rent period expired");
        require(
            isavailableforrent(_itemID, _startAt, _endAt),
            "already booked for time period"
        );

        // get rent on nft with duration
        uint256 rent = calculateRent(_itemID, duration);

        // calculate rent discount and provide discount to contract owner fund and split toke to nft owner and contract owner
        (
            uint256 collectingRent,
            uint256 discount
        ) = calculateDiscountCommisionFund(rent, duration, _packageID);

        // reduce discounted amount to user;
        rent -= discount;

        // get nft rented amount and update in contract
        nftdetail.rentcollected += collectingRent;
        inventoryinstance.update(nftdetail, _itemID);

        // transfer nft owner tokens to contract
        feetoken.safeTransferFrom(msg.sender, address(this), rent);

        // clone wrapped contract and transfer to rent user
        address clone = Clones.clone(erc721tokenImplementation);
        wrapped(clone).initialize(
            _endAt,
            _startAt,
            ERC721(nftdetail.collectionAddress).name(),
            ERC721(nftdetail.collectionAddress).symbol(),
            ERC721(nftdetail.collectionAddress).tokenURI(nftdetail.nftID),
            msg.sender,
            nftdetail.nftID
        );

        emit NFTIsRented(
            _itemID,
            wrapped(clone),
            discount,
            msg.sender,
            nftdetail.owner,
            rent,
            _startAt,
            _endAt,
            _packageID
        );

        // add renting details
        addRentedNFT(wrapped(clone), _startAt, _endAt, _itemID, collectingRent);
    }

    // store renting detail with durations
    function addRentedNFT(
        wrapped wrappednftadderess,
        uint256 _startAt,
        uint256 _endAt,
        uint256 _itemID,
        uint256 _rentAmount
    ) private {
        NFTRented memory nftisrented = NFTRented({
            wrappedNFT: wrappednftadderess,
            endAt: _endAt,
            startAt: _startAt,
            rentAmount: _rentAmount
        });

        rentedindex[_itemID].push(nftisrented);
    }

    function isavailableforrent(
        uint8 _itemID,
        uint256 _startAt,
        uint256 _endAt
    ) private view returns (bool) {
        // start date is alsway grater than current time, and end date is greater than start date
        require(
            _startAt >= (block.timestamp - 86400) && _endAt >= _startAt,
            "Start / End date not valid!"
        );

        uint counter = 0;
        for (uint256 i = 0; i < rentedindex[_itemID].length; i++) {
            if (
                (_startAt >= rentedindex[_itemID][i].startAt &&
                    _startAt < rentedindex[_itemID][i].endAt) ||
                (_endAt > rentedindex[_itemID][i].startAt &&
                    _endAt <= rentedindex[_itemID][i].endAt) ||
                (rentedindex[_itemID][i].startAt >= _startAt &&
                    rentedindex[_itemID][i].endAt <= _endAt)
            ) {
                counter++;
            }

            unchecked {
                i++;
            }
        }

        if (counter > 0) {
            return false;
        } else {
            return true;
        }
    }

    // calculate owner and nft owner commission
    function calculateDiscountCommisionFund(
        uint256 rent,
        uint256 duration,
        uint256 _packageID
    ) private returns (uint256, uint256) {
        // get commission of whole amount
        uint256 ownerRentCommision = (rent * rentCommision) / 100;
        uint256 collectingRent = rent - ownerRentCommision;

        // get discount of nft
        uint256 discount = 0;
        Package memory package = packages[_packageID];
        if (package.requiredtime <= duration) {
            discount = package.discountinbps;
        }

        // get discount amount
        uint256 discountAmt = (rent * discount) / 100;

        // provide nft discount on contract owner balance
        ownerRentCommision -= discountAmt;

        // rentCommisionFunds
        rentCommisionFunds = rentCommisionFunds + ownerRentCommision;

        return (collectingRent, discountAmt);
    }

    //                                   End Internal Private methods
    // =======================================================================================================
}
