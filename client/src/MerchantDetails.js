import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "react-nice-dates/build/style.css";
import { useParams } from "react-router-dom";

import ListAssets from "./ListAssets";

const MerchantDetails = props => {
  const [stackId, setStackID] = useState(null);
  const [dataKey, setDataKey] = useState(null);
  const [item, setItemDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  let { id } = useParams();

  useEffect(() => {
    getItem();
  }, []);

  const getItem = async () => {
    const contract = await drizzle.contracts.Coupoken;

    let merchant = await contract.methods
      .getMerchantInfo(id)
      .call({ from: drizzleState.accounts[0] });
    let response = await fetch(merchant.merchantURI);
    let data = await response.json();
    merchant.id = id;
    merchant.data = data;
    setItemDetails(merchant);
  };

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;
    getItem();
    // otherwise, return the transaction status
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
              <div>
                <strong>Description</strong>
                <div className="details_box">{item.data.description}</div>
                <br />
                <div className="row">
                  <div className="six columns">
                    <strong>Category</strong>
                    <div>{item.category}</div>
                  </div>
                  <div className="six columns">
                    <strong>Created</strong>
                    <div>
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      }).format(item.createdAt * 1000)}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="u-full-width">
                    <strong>Website</strong>
                    <div>{item.websiteUrl}</div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <br />
          </div>
        </div>
      )}
      <hr />
      <ListAssets
        drizzle={drizzle}
        drizzleState={drizzleState}
        address={id}
        getMethod={"tokensOfMerchant"}
      />
    </section>
  );
};

export default MerchantDetails;
