import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const RestaurantCard = ({ item, account, handleBuy, handleLock}) => (
  <div className="token_box">
    <h4>{item.data.name}</h4>
    <img src={item.data.image} />
    <br />
    <strong>Description</strong>
    <div>
      {item.data.description.length > 160
        ? item.data.description.substring(0, 160) + "..."
        : item.data.description}
    </div>
    <div className="row">
      <div className="four columns">
        <strong>Merchant</strong>
        <Link to={"/merchant/" + item.merchantAdr}>
          <div>{item.merchantName}</div>
        </Link>
      </div>
    </div>
    <div className="row">
      <div className="u-full-width">
        <strong>Location</strong>
        <div>{item.data.location}</div>
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
    <br />
    {item.owner === account &&
      <div>
        {item.tradable ? (
          <input
            className="button-primary u-full-width"
            type="button"
            value="Lock Asset"
            onClick={handleLock}
          />
        ) : (
          <input
            className="button-primary u-full-width"
            type="button"
            value="Unlock Asset"
            onClick={handleLock}
          />
        )}
      </div>
    }
    <Link to={"/asset/" + item.id}>
      <input className="u-full-width" type="button" value="Details" />
    </Link>
  </div>
);

export default RestaurantCard;
