import React, { useState, useEffect } from "react";
import TokenCard from "./components/TokenCard";
import * as _ from "lodash";

const ListAssets = props => {
  const [dataKey, setDataKey] = useState(null);
  const [couponDetails, setCouponsDetails] = useState([]);
  const { drizzle, drizzleState, address, getMethod } = props;
  const { Coupoken } = drizzleState.contracts;
  const { accountAddress = drizzleState.accounts[0] } = address;

  useEffect(() => {
    getCoupons();
  }, []);

  const toggleLock = async (_id, _tradable) => {
    const contract = await drizzle.contracts.Coupoken;
    await contract.methods.toggleLockCoupon.cacheSend(_id, !_tradable, {
      from: drizzleState.accounts[0]
    });
  };
  const getCoupons = async () => {
    const contract = await drizzle.contracts.Coupoken;
    let result = await contract.methods[getMethod](accountAddress).call({
      from: drizzleState.accounts[0]
    });
    Promise.all(
      result.map(async i => {
        let coupon = await contract.methods
          .getCouponInfo(i)
          .call({ from: drizzleState.accounts[0] });
        coupon.owner = await contract.methods
          .ownerOf(i)
          .call({ from: drizzleState.accounts[0] });
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
      })
    );
  };

  return (
    <section>
      <h2>Assets</h2>
      <div className="token_container">
        {couponDetails &&
          _.orderBy(couponDetails, "createdAt", "desc").map(item => (
            <TokenCard
              key={item.id}
              item={item}
              account={drizzleState.accounts[0]}
              handleLock={() => toggleLock(item.id, item.tradable)}
              handleBuy={_ => null}
            />
          ))}
      </div>
    </section>
  );
};

ListAssets.defaultProps = {
  counter: 0
};

export default ListAssets;
