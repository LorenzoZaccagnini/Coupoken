import React, { useState, useEffect } from "react";
import TokenCard from "./components/TokenCard";
import { Link } from "react-router-dom";

const ListTrees = props => {
  const [stackId, setStackID] = useState(null);
  const [dataKey, setDataKey] = useState(null);
  const [couponDetails, setCouponsDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  useEffect(() => {
    getCoupons();
  }, []);

  const getCoupons = async () => {
    const contract = await drizzle.contracts.Coupoken;
    let result = await contract.methods
      .totalSupply()
      .call({ from: drizzleState.accounts[0] });
    let requests = [];

    for (var i = 1; i <= parseInt(result); i++) {
      let coupon = await contract.methods
        .getCouponInfo(i)
        .call({ from: drizzleState.accounts[0] });
      coupon.owner = await contract.methods
        .ownerOf(i)
        .call({ from: drizzleState.accounts[0] });
      if (coupon.tradable) {
        let merchant = await contract.methods
          .getMerchantInfo(coupon.merchantAdr)
          .call({ from: drizzleState.accounts[0] });
        let uri = await contract.methods
          .tokenURI(i)
          .call({ from: drizzleState.accounts[0] });
        let response = await fetch(uri);
        let data = await response.json();
        coupon.id = i;
        coupon.data = data;
        coupon.uri = uri;
        coupon.merchantName = merchant.merchantName;
        setCouponsDetails(couponDetails => [...couponDetails, coupon]);
      }
    }
  };

  const buyCoupon = async price => {
    console.log("buy: ", price);
    const contract = await drizzle.contracts.Coupoken;
    const stackId = contract.methods["buyCoupon"].cacheSend(price, {
      from: drizzleState.accounts[0],
      value: parseInt(price)
    });
    // save the `stackId` for later reference
    setStackID(stackId);
  };

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;
    getCoupons();
    // otherwise, return the transaction status
    return `Transaction status: ${transactions[txHash] &&
      transactions[txHash].status}`;
  };

  return (
    // if it exists, then we display its value
    <section>
      <h2>Adopt a tree</h2>
      {couponDetails && (
        <div className="token_container">
          {couponDetails.map(item => (
            <TokenCard
              key={item.id}
              item={item}
              account={drizzleState.accounts[0]}
              handleBuy={() => buyCoupon(item.price)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ListTrees;
