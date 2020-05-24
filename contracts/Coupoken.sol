pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";

import "./Pausable.sol";



contract Coupoken is ERC721Full, ERC721Mintable, Pausable {


  constructor() ERC721Full("Coupoken", "CPK") public {}

  string public myString = "test";

  function set(string memory x) public {
    myString = x;
  }

  mapping(uint256 => Coupon) public tokenIdToCouponInfo;
  mapping(address => Merchant) public addressToMerchant;

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
  }

  struct Coupon {
        uint256 discountSize;
        uint256 price;
        uint256 deadline;
        uint256 createdAt;
        address merchantAdr;
        bool tradable;
    }

  modifier isCouponMerchantOwner(uint256 _tokenId) {
    require(msg.sender == tokenIdToCouponInfo[_tokenId].merchantAdr && msg.sender == ownerOf(_tokenId));
    _;
  }

  modifier isCouponTradable(uint256 _tokenId) {
    require(tokenIdToCouponInfo[_tokenId].tradable == true, "token locked");
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
    string calldata _websiteUrl
  )
    external
    isMerchantExistent
    whenNotPaused
  {
    Merchant memory newMerchant= Merchant(now, _name, _category, _websiteUrl, true);
    addressToMerchant[msg.sender] = newMerchant;
    merchantList.push(msg.sender);
  }



  function createCoupon(
    uint256 _discountSize,
    uint256 _price,
    uint256 _deadline,
    uint256 _tokenId,
    string  memory _tokenURI
  )
    public
    isMerchantEnabled
    whenNotPaused
  {
      Coupon memory newCoupon = Coupon(_discountSize, _price, _deadline, now, msg.sender, true);
      tokenIdToCouponInfo[_tokenId] = newCoupon;
      _safeMint(msg.sender, _tokenId);
      _setTokenURI(_tokenId, _tokenURI);
  }

  function transferCoupon(address _target, uint256 _tokenId) public whenNotPaused {
       require(ownerOf(_tokenId) == msg.sender, "You are not the owner");
       _transferFrom(msg.sender, _target, _tokenId);
   }


  function toggleLockCoupon(uint256 _tokenId, bool _tradable)
    public
    isCouponMerchantOwner(_tokenId)
    isCouponTradable(_tokenId)
  {
    tokenIdToCouponInfo[_tokenId].tradable = _tradable;
  }


  function getCouponInfo (uint _tokenId) public view returns (
    uint256 discountSize,
    uint256 price,
    uint256 deadline,
    uint256 createdAt,
    address merchantAdr,
    bool tradable,
    address actualOwner
      ) {
      return (
        tokenIdToCouponInfo[_tokenId].discountSize,
        tokenIdToCouponInfo[_tokenId].price,
        tokenIdToCouponInfo[_tokenId].deadline,
        tokenIdToCouponInfo[_tokenId].createdAt,
        tokenIdToCouponInfo[_tokenId].merchantAdr,
        tokenIdToCouponInfo[_tokenId].tradable,
        ownerOf(_tokenId)
      );
  }

  function getMerchantInfo (address _merchantAdr) public view returns (
    uint256 createdAt,
    string memory merchantName,
    string memory category,
    string memory websiteUrl,
    bool enabled
      ) {
      return (
        addressToMerchant[_merchantAdr].createdAt,
        addressToMerchant[_merchantAdr].name,
        addressToMerchant[_merchantAdr].category,
        addressToMerchant[_merchantAdr].websiteUrl,
        addressToMerchant[_merchantAdr].enabled
      );
  }

  function _make_payable(address x) internal pure returns (address payable) {
       return address(uint160(x));
   }

   function buyCoupon(uint256 _tokenId) public  payable {
       address ownerAddress = ownerOf(_tokenId);
       require(msg.value == tokenIdToCouponInfo[_tokenId].price, "You need to send the exact amount of Ether");
       _transferFrom(ownerAddress,  msg.sender, _tokenId);
       address payable ownerAddressPayable = _make_payable(ownerAddress);
       ownerAddressPayable.transfer(tokenIdToCouponInfo[_tokenId].price);
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

}
