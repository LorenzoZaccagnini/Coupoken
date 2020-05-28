import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "react-nice-dates/build/style.css";
import { Link } from "react-router-dom";

import { useParams } from "react-router-dom";

const ListAssets = props => {
  const [stackId, setStackID] = useState(null);
  const [dataKey, setDataKey] = useState(null);
  const [item, setCouponsDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  let { id } = useParams();

  useEffect(() => {
    getCoupons();
  }, []);

  const toggleLock = async () => {
    const contract = await drizzle.contracts.Coupoken;
    const stackId = contract.methods["toggleLockCoupon"].cacheSend(
      !item.tradable,
      {
        from: drizzleState.accounts[0]
      }
    );
    setStackID(stackId);
  };

  const { register, handleSubmit, watch, errors } = useForm();

  const setPriceCoupon = data => {
    setPrice(data.id, data.price);
  };

  const setPrice = async (_id, _price) => {
    const contract = await drizzle.contracts.Coupoken;
    const stackId = contract.methods["setPriceCoupon"].cacheSend(_id, _price, {
      from: drizzleState.accounts[0]
    });
    setStackID(stackId);
  };

  const getCoupons = async () => {
    const contract = await drizzle.contracts.Coupoken;
    let coupon = await contract.methods
      .getCouponInfo(id)
      .call({ from: drizzleState.accounts[0] });
    coupon.owner = await contract.methods
      .ownerOf(id)
      .call({ from: drizzleState.accounts[0] });
    let merchant = await contract.methods
      .getMerchantInfo(coupon.merchantAdr)
      .call({ from: drizzleState.accounts[0] });
    let uri = await contract.methods
      .tokenURI(id)
      .call({ from: drizzleState.accounts[0] });
    let response = await fetch(uri);
    let data = await response.json();
    coupon.id = id;
    coupon.data = data;
    coupon.uri = uri;
    coupon.merchantName = merchant.merchantName;
    setCouponsDetails(coupon);
  };

  const getTxStatus = () => {
    const { transactions, transactionStack } = drizzleState;
    const txHash = transactionStack[stackId];
    if (!txHash) return null;
    getCoupons();
    return `Transaction status: ${transactions[txHash] &&
      transactions[txHash].status}`;
  };

  return (
    // if it exists, then we display its value
    <section>
      {item.data && (
        <div className="">
          <div className="u-full-width">
            <div className="details_container">
              <div align="center">
                <h2>{item.data.name}</h2>
              </div>
              <div align="center" />
            </div>
            <div className="details_container">
              <div className="img_container">
                <img src={item.data.image} />
                <br />
              </div>
              <div className="details_box">
                <strong>Description</strong>
                <div>{item.data.description}</div>
                <br />
                <div className="row">
                  <div className="four columns">
                    <strong>Merchant</strong>
                    <Link to={"/merchant/" + item.merchantAdr}>
                      <div>{item.merchantName}</div>
                    </Link>
                  </div>
                  <div className="four columns">
                    <strong>Price</strong>
                    <div>{item.price}</div>
                  </div>

                  <div className="four columns">
                    <strong>Discount</strong>
                    <div>{item.discountSize}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="four columns">
                    <strong>Created</strong>
                    <div>
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      }).format(item.createdAt * 1000)}
                    </div>
                  </div>
                  <div className="four columns">
                    <strong>Deadline</strong>
                    <div>
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      }).format(item.deadline * 1000)}
                    </div>
                  </div>
                  <div className="four columns">
                    <strong>ID</strong>
                    <div>{item.id}</div>
                  </div>
                </div>
                {item.owner === drizzleState.accounts[0] && (
                  <div className="">
                    <form onSubmit={handleSubmit(setPriceCoupon)}>
                      <div className="row">
                        <div className="u-full-width">
                          <label htmlFor="price">Change price</label>
                          <input
                            name="price"
                            className="u-full-width"
                            type="number"
                            ref={register({ min: 1 })}
                          />
                          {errors.name && <span>Use a valid input</span>}
                        </div>
                      </div>
                      <input
                        className="button-primary"
                        type="submit"
                        value="Change Price"
                      />
                    </form>
                    <strong>Toggle tradable status</strong>
                    <br />
                    <br />

                    {item.tradable ? (
                      <input
                        class="button-primary"
                        type="button"
                        value="Lock Asset"
                        onClick={() => toggleLock()}
                      />
                    ) : (
                      <input
                        class="button-primary"
                        type="button"
                        value="Unlock Asset"
                        onClick={() => toggleLock()}
                      />
                    )}
                    <div>{getTxStatus()}</div>
                  </div>
                )}
              </div>
            </div>
            <br />
            <br />
          </div>
        </div>
      )}
    </section>
  );
};

export default ListAssets;
