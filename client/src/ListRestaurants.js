import React, { useState, useEffect } from "react";
import RestaurantCard from "./components/RestaurantCard";
import { Link } from "react-router-dom";
import * as _ from "lodash";
import { useParams } from "react-router-dom";

const ListRestaurants = props => {
  const [dataKey, setDataKey] = useState(null);
  const [couponDetails, setCouponsDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  const { category } = useParams();


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
    let result = await contract.methods
      .tokensOfCategory(category)
      .call({ from: drizzleState.accounts[0] });
    Promise.all(
      result.map(async i => {
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
      })
    )

  };

  const buyCoupon = async (_id, _price) => {
    const contract = await drizzle.contracts.Coupoken;
    const stackId = contract.methods["buyCoupon"].cacheSend(_id, {
      from: drizzleState.accounts[0],
      value: parseInt(_price)
    });
  };


  return (
    // if it exists, then we display its value
    <section>
      <h2>Order from a Restaurant</h2>
      {couponDetails && (
        <div className="token_container">
          {_.orderBy(couponDetails, "createdAt", "desc").map(item => (
            <RestaurantCard
              key={item.id}
              item={item}
              account={drizzleState.accounts[0]}
              handleBuy={() => buyCoupon(item.id, item.price)}
              handleLock={() => toggleLock(item.id, item.tradable)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ListRestaurants;
