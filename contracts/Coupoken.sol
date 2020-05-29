pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";

import "./Pausable.sol";



contract Coupoken is ERC721Full, Pausable {


  constructor() ERC721Full("Coupoken", "CPK") public {}


  mapping(uint256 => Coupon) public tokenIdToCouponInfo;
  mapping(address => Merchant) public addressToMerchant;
  mapping(address => uint256) private merchantTokensCounter;
  mapping(string => uint256) private tokenCategoryCounter;

  address[] public merchantList;


  function getMerchantList() external view returns (address[] memory) {
    return merchantList;
  }


  struct Merchant {
    uint256 createdAt;
    string name;
    string category;
    string websiteUrl;
    bool enabled;
    string merchantURI;

  }

  struct Coupon {
        uint256 discountSize;
        uint256 price;
        uint256 deadline;
        uint256 createdAt;
        address merchantAdr;
        bool tradable;
        string category;
    }

  modifier isCouponMerchantOwner(uint256 _tokenId) {
    require(msg.sender == tokenIdToCouponInfo[_tokenId].merchantAdr && msg.sender == ownerOf(_tokenId));
    _;
  }

  modifier isCouponMerchant(uint256 _tokenId) {
    require(msg.sender == tokenIdToCouponInfo[_tokenId].merchantAdr);
    _;
  }

  modifier isCouponTradable(uint256 _tokenId) {
    require(tokenIdToCouponInfo[_tokenId].tradable == true, "token locked");
    _;
  }

  modifier isCouponOwner (uint256 _tokenId) {
    require(msg.sender == ownerOf(_tokenId), "you must be the owner");
    _;
  }

  modifier isMerchantExistent() {
    require(addressToMerchant[msg.sender].createdAt == 0, "Duplicates not allowed");
    _;
  }

  modifier isMerchantEnabled() {
    require(addressToMerchant[msg.sender].enabled == true, "not allowed");
    _;
  }

  function createMerchant(
    string calldata _name,
    string calldata _category,
    string calldata _websiteUrl,
    string calldata _merchantURI
  )
    external
    isMerchantExistent
    whenNotPaused
  {
    Merchant memory newMerchant= Merchant(now, _name, _category, _websiteUrl, true, _merchantURI);
    addressToMerchant[msg.sender] = newMerchant;
    merchantList.push(msg.sender);
  }



  function createCoupon(
    uint256 _discountSize,
    uint256 _price,
    uint256 _deadline,
    uint256 _tokenId,
    string  calldata _tokenURI,
    string  calldata _category
  )
    external
    isMerchantEnabled
    whenNotPaused
  {
      Coupon memory newCoupon = Coupon(_discountSize, _price, _deadline, now, msg.sender, true, _category);
      tokenIdToCouponInfo[_tokenId] = newCoupon;
      _safeMint(msg.sender, _tokenId);
      _setTokenURI(_tokenId, _tokenURI);
      tokenCategoryCounter[_category]++;
      merchantTokensCounter[msg.sender]++;
  }

  function transferCoupon(address _target, uint256 _tokenId) public whenNotPaused isCouponOwner(_tokenId) {
       _transferFrom(msg.sender, _target, _tokenId);
   }


  function toggleLockCoupon(uint256 _tokenId, bool _tradable)
    external
    isCouponOwner(_tokenId)
  {
    tokenIdToCouponInfo[_tokenId].tradable = _tradable;
  }

  function setPriceCoupon(uint256 _tokenId, uint256 _price)
    external
    isCouponOwner(_tokenId)
  {
    tokenIdToCouponInfo[_tokenId].price = _price;
  }

  function setDeadlineCoupon(uint256 _tokenId, uint256 _deadline)
    external
    isCouponMerchantOwner(_tokenId)
  {
    tokenIdToCouponInfo[_tokenId].deadline = _deadline;
  }


  function claimBackCoupon(address _target, uint256 _tokenId) external whenNotPaused isCouponMerchant(_tokenId) {
        require(now > tokenIdToCouponInfo[_tokenId].deadline, "You need to wait the deadline");
        address ownerAddress = ownerOf(_tokenId);
        _transferFrom(ownerAddress,  msg.sender, _tokenId);
   }


  function getCouponInfo (uint _tokenId) external view returns (
    uint256 discountSize,
    uint256 price,
    uint256 deadline,
    uint256 createdAt,
    address merchantAdr,
    bool tradable,
    string memory _category
      ) {
      return (
        tokenIdToCouponInfo[_tokenId].discountSize,
        tokenIdToCouponInfo[_tokenId].price,
        tokenIdToCouponInfo[_tokenId].deadline,
        tokenIdToCouponInfo[_tokenId].createdAt,
        tokenIdToCouponInfo[_tokenId].merchantAdr,
        tokenIdToCouponInfo[_tokenId].tradable,
        tokenIdToCouponInfo[_tokenId].category
      );
  }

  function getMerchantInfo (address _merchantAdr) external view returns (
    uint256 createdAt,
    string memory merchantName,
    string memory category,
    string memory websiteUrl,
    bool enabled,
    string memory merchantURI
      ) {
      return (
        addressToMerchant[_merchantAdr].createdAt,
        addressToMerchant[_merchantAdr].name,
        addressToMerchant[_merchantAdr].category,
        addressToMerchant[_merchantAdr].websiteUrl,
        addressToMerchant[_merchantAdr].enabled,
        addressToMerchant[_merchantAdr].merchantURI
      );
  }

  function _make_payable(address x) internal pure returns (address payable) {
       return address(uint160(x));
   }

   function buyCoupon(uint256 _tokenId) external  payable {
       address ownerAddress = ownerOf(_tokenId);
       require(tokenIdToCouponInfo[_tokenId].tradable, "Tradable not enabled");
       require(msg.value == tokenIdToCouponInfo[_tokenId].price, "You need to send the exact amount of Ether");
       _transferFrom(ownerAddress,  msg.sender, _tokenId);
       address payable ownerAddressPayable = _make_payable(ownerAddress);
       ownerAddressPayable.transfer(tokenIdToCouponInfo[_tokenId].price);
       tokenIdToCouponInfo[_tokenId].tradable = false;
   }


   function tokensOfOwner(address _owner) external view returns(uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalCoupons = totalSupply();
            uint256 resultIndex = 0;
            uint256 couponId;

            for (couponId = 1; couponId <= totalCoupons; couponId++) {
                if (ownerOf(couponId) == _owner) {
                    result[resultIndex] = couponId;
                    resultIndex++;
                }
            }

            return result;
        }
      }

    function tokensOfCategory(string calldata _category) external view returns(uint256[] memory ownerTokens) {
        uint256 totalCoupons = totalSupply();
         if (totalCoupons == 0) {
             return new uint256[](0);
         } else {
             uint256[] memory result = new uint256[](tokenCategoryCounter[_category]);
             uint256 resultIndex = 0;
             uint256 couponId;

             for (couponId = 1; couponId <= totalCoupons; couponId++) {
                 if (keccak256(bytes(_category)) == keccak256(bytes(tokenIdToCouponInfo[couponId].category))) {
                     result[resultIndex] = couponId;
                     resultIndex++;
                 }
             }
             return result;
         }
       }

       function tokensOfMerchant(address _merchant) external view returns(uint256[] memory merchantTokens) {
            uint256 tokenCount = balanceOf(_merchant);

            if (tokenCount == 0) {
                return new uint256[](0);
            } else {
                uint256[] memory result = new uint256[](merchantTokensCounter[_merchant]);
                uint256 totalCoupons = totalSupply();
                uint256 resultIndex = 0;
                uint256 couponId;

                for (couponId = 1; couponId <= totalCoupons; couponId++) {
                    if (tokenIdToCouponInfo[couponId].merchantAdr == _merchant) {
                        result[resultIndex] = couponId;
                        resultIndex++;
                    }
                }

                return result;
            }
          }

}
