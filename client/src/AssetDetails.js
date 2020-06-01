import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "react-nice-dates/build/style.css";
import { Link } from "react-router-dom";

import { useParams } from "react-router-dom";

const ListAssets = props => {
  const [stackId, setStackID] = useState(null);
  const [cart, setCart] = useState(0);
  const [dataKey, setDataKey] = useState(null);
  const [item, setItemDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  let { id } = useParams();

  useEffect(() => {
    getItems();
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

  const claimBackCoupon = async () => {
    const contract = await drizzle.contracts.Coupoken;
    const stackId = contract.methods["claimBackCoupon"].cacheSend(id, {
      from: drizzleState.accounts[0]
    });
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

  const getItems = async () => {
    const contract = await drizzle.contracts.Coupoken;
    let item = await contract.methods
      .getCouponInfo(id)
      .call({ from: drizzleState.accounts[0] });
    item.owner = await contract.methods
      .ownerOf(id)
      .call({ from: drizzleState.accounts[0] });
    let merchant = await contract.methods
      .getMerchantInfo(item.merchantAdr)
      .call({ from: drizzleState.accounts[0] });
    let uri = await contract.methods
      .tokenURI(id)
      .call({ from: drizzleState.accounts[0] });
    let response = await fetch(uri);
    let data = await response.json();
    item.id = id;
    item.data = data;
    item.uri = uri;
    item.merchantName = merchant.merchantName;
    if (item.data.menu) {
      item.data.menu.forEach((el, i) => {
        item.data.menu[i].qty = 0;
      });
    }
    setItemDetails(item);
  };

  const getTxStatus = () => {
    const { transactions, transactionStack } = drizzleState;
    const txHash = transactionStack[stackId];
    if (!txHash) return null;
    getItems();
    return `Transaction status: ${transactions[txHash] &&
      transactions[txHash].status}`;
  };

  const handleFoodQty = (index, isAdding, value) => {
    if (!isAdding && value === 0) {
      return;
    }
    const tempValue = isAdding ? 1 : -1;
    setCart(cart + item.data.menu[index].price * tempValue);
    setItemDetails(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        menu: [
          ...prevState.data.menu.slice(0, index),
          Object.assign({}, prevState.data.menu[index], {
            qty: prevState.data.menu[index].qty + tempValue
          }),
          ...prevState.data.menu.slice(index + 1)
        ]
      }
    }));
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

                    <div className="row">
                      <div className="six columns">
                        <strong>Toggle tradable status</strong>
                        <br />
                        <br />
                        {item.tradable ? (
                          <input
                            className="button-primary"
                            type="button"
                            value="Lock Asset"
                            onClick={() => toggleLock()}
                          />
                        ) : (
                          <input
                            className="button-primary"
                            type="button"
                            value="Unlock Asset"
                            onClick={() => toggleLock()}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {item.merchantAdr === drizzleState.accounts[0] &&
                  item.merchantAdr !== item.owner && (
                    <div className="row">
                      <div className="six columns">
                        <strong>Claim back</strong>
                        <br />
                        <br />
                        {Date.now() > item.deadline * 1000 ? (
                          <input
                            className="button-primary"
                            type="button"
                            value="Claim Back"
                            onClick={() => claimBackCoupon()}
                          />
                        ) : (
                          <input className="" type="button" value="DISABLED" />
                        )}
                      </div>
                    </div>
                  )}
                <div>{getTxStatus()}</div>
              </div>
            </div>
            <br />
            <br />
          </div>
          {item.data.menu &&
            item.data.menu.length > 0 && (
              <div>
                <h2>Menu</h2>
                {item.data.menu.map((food, i) => (
                  <div key={food.name}>
                    <div className="row">
                      <div className="eight columns">
                        <h5 style={menuStyle.title}>{food.name}</h5>
                        <div style={menuStyle.desc}>{food.description}</div>
                        <strong>Price: </strong>
                        {food.price} Wei
                      </div>
                      <div className="two columns">
                        <input
                          className="button-primary"
                          style={menuStyle.actionBtn}
                          type="button"
                          value="+"
                          onClick={() => handleFoodQty(i, true, food.qty)}
                        />
                        <br />
                        Quantity: {food.qty}
                      </div>
                      <div className="two columns">
                        <input
                          className="button-primary"
                          style={menuStyle.actionBtn}
                          type="button"
                          value="-"
                          onClick={() => handleFoodQty(i, false, food.qty)}
                        />
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}
                <div className="row" align="center">
                  <div className="eight columns">
                    <span>Total: {cart} Wei</span>
                  </div>
                  <div className="four columns" align="left">
                    <input
                      className="button-primary"
                      style={menuStyle.actionBtn}
                      type="button"
                      value="Checkout"
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </section>
  );
};

const menuStyle = {
  title: {
    marginBottom: "0.5rem"
  },
  desc: {
    color: "grey"
  },
  actionBtn: {
    backgroundColor: "red",
    borderColor: "#ed0000"
  }
};

export default ListAssets;
