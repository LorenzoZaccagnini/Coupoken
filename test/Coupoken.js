const Coupoken = artifacts.require("./Coupoken.sol");
const truffleAssert = require("truffle-assertions");

contract("Coupoken", accounts => {
  it("first account should be the owner", async () => {
    const coupoken = await Coupoken.deployed();
    assert.equal(await coupoken.owner(), accounts[0]);
  });

  it("should have the name and symbol", async () => {
    const coupoken = await Coupoken.deployed();
    let user1 = accounts[1];
    assert.equal(await coupoken.symbol(), "CPK");
    assert.equal(await coupoken.name(), "Coupoken");
  });

  it("should create a merchant", async () => {
    const coupoken = await Coupoken.deployed();
    let user1 = accounts[1];
    await coupoken.createMerchant(
      "Devoleum",
      "Agritech",
      "Devoleum.com",
      "https://raw.githubusercontent.com/LorenzoZaccagnini/Coupoken/master/dummy_json/1_merchant.json",
      { from: user1 }
    );
    let merchantInfo = await coupoken.getMerchantInfo(user1, { from: user1 });
    assert.equal(merchantInfo[1], "Devoleum");
    assert.equal(merchantInfo[2], "Agritech");
    assert.equal(merchantInfo[3], "Devoleum.com");
    assert.equal(merchantInfo[4], true);
    assert.equal(
      merchantInfo[5],
      "https://raw.githubusercontent.com/LorenzoZaccagnini/Coupoken/master/dummy_json/1_merchant.json"
    );
  });

  it("should not duplicate a merchant address", async () => {
    const coupoken = await Coupoken.deployed();
    let user1 = accounts[1];
    await truffleAssert.reverts(
      coupoken.createMerchant("Alice", "Clothes", "test2.com", "https://test.com/info.json", { from: user1 }),
      "Duplicates not allowed"
    );
  });

  it("should create a coupon", async () => {
    const coupoken = await Coupoken.deployed();
    let user1 = accounts[1];
    await coupoken.createCoupon("50", "1000", "999999999", "1", "https://test.com/info.json", "test", {
      from: user1
    });
    let couponInfo = await coupoken.getCouponInfo(1, { from: user1 });
    assert.equal(couponInfo[0], "50");
    assert.equal(couponInfo[1], "1000");
    assert.equal(couponInfo[2], "999999999");
    assert.equal(couponInfo[4], user1);
    assert.equal(couponInfo[5], true);
    assert.equal(couponInfo[6], "test");
  });

  it("should buy the coupon", async () => {
    const coupoken = await Coupoken.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let cp1 = 4;
    let couponPrice = web3.utils.toWei(".01", "ether");
    let valuePrice = web3.utils.toWei(".01", "ether");
    await coupoken.createCoupon(
      "50",
      couponPrice,
      "999999999",
      cp1,
      "test.com",
      "test",
      { from: user1 }
    );
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    console.log("Balance of user before: ", balanceOfUser1BeforeTransaction);
    await coupoken.buyCoupon(cp1, { from: user2, value: valuePrice });
    console.log(
      "Balance of user after buy: ",
      await web3.eth.getBalance(user2)
    );
    assert.equal(await coupoken.ownerOf.call(cp1), user2);
  });
});
