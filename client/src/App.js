import React, { useState, useEffect, Fragment } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SetMerchant from "./SetMerchant";
import SetCoupon from "./SetCoupon";
import ListMerchants from "./ListMerchants";
import ListCoupokens from "./ListCoupokens";
import ListTrees from "./ListTrees";
import ListRestaurants from "./ListRestaurants";
import ListAssets from "./ListAssets";
import AssetDetails from "./AssetDetails";
import MerchantDetails from "./MerchantDetails";

const App = props => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true
  });
  const { drizzle } = props;

  useEffect(
    () => {
      const unsubscribe = drizzle.store.subscribe(() => {
        // every time the store updates, grab the state from drizzle
        const drizzleState = drizzle.store.getState();
        // check to see if it's ready, if so, update local component state
        if (drizzleState.drizzleStatus.initialized) {
          setDrizzleReadinessState({
            drizzleState: drizzleState,
            loading: false
          });
        }
      });
      return () => {
        unsubscribe();
      };
    },
    [drizzle.store, drizzleReadinessState]
  );

  const imgStyle = {
    width: "256px"
  };

  return drizzleReadinessState.loading ? (
    <div align="center">
      <h4>
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Please install Metamask extension and reload the page
        </a>
      </h4>
      Set it on the rinkeby test network
      <div>
        <img
          style={imgStyle}
          src={
            "https://images.unsplash.com/photo-1563551937069-caa966ba3aa8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80"
          }
        />
      </div>
      <div>Photo by Lachlan Gowen on Unsplash</div>
    </div>
  ) : (
    <Router>
      <div>
        <div className="title_logo">
          <img
            src={
              "https://www.devoleum.com/47fa9787d0791533e573aed32e8147a9.png"
            }
          />
          <h1>Devoleum - Coupoken</h1>
        </div>
        <div>
          <a
            href="https://www.devoleum.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Devoleum
          </a>{" "}
          team{" "}
          <a
            href="https://www.linkedin.com/in/lorenzo-zaccagnini/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lorenzo Zaccagnini
          </a>{" "}
          and{" "}
          <a
            href="https://www.linkedin.com/in/elisa-romondia/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Elisa Romondia
          </a>{" "}
          developed Coupoken. An{" "}
          <a
            href="https://github.com/LorenzoZaccagnini/Coupoken"
            target="_blank"
            rel="noopener noreferrer"
          >
            open-source
          </a>{" "}
          DAPP, everyone can improve it and implement it on ethereum blockchain.
          Coupoken tokens can be sold and/or transferred as needed, helping
          businesses to reopen and be sustainable. They can be used in many
          ways, for an investment that offers a simple discount up to the
          adoption of fruit trees. Through the integration of oracles, it will
          also be possible to manage logics external to the blockchain,
          especially thanks to open banking.
        </div>
        <br />
        <div>
          Coupoken allows merchants to receive investments directly from
          customers. The investment is expressed in the form of a coupon, a 721
          token, which can be sold and / or transferred according to the
          merchant's choices. There is the possibility of selling them using the
          cryptocurrencies, or using oracles and adjusting the transfers
          according to more complex logics external to the ethereum blockchain.
        </div>
        <br />
        <br />

        <nav className="menu">
          <ul>
            <li>
              <Link to="/">List trees</Link>
            </li>
            <li>
              <Link to="/category/Restaurant">List Restaurants</Link>
            </li>
            <li>
              <Link to="/myassets">Your Assets</Link>
            </li>
            <li>
              <Link to="/setcoupon">Create Coupon</Link>
            </li>
            <li>
              <Link to="/setmerchant">Create Merchant</Link>
            </li>
            <li>
              <a
                href="https://www.devoleum.com/#contacts"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact us
              </a>
            </li>
          </ul>
        </nav>

        <hr />
        <br />
        <Switch>
          <Route exact path="/">
            <ListTrees
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route exact path="/category/:category">
            <ListRestaurants
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route exact path="/myassets">
            <ListAssets
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
              address={drizzleReadinessState.drizzleState.accounts[0]}
              getMethod={"tokensOfOwner"}
            />
          </Route>
          <Route exact path="/asset/:id">
            <AssetDetails
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route exact path="/merchant/:id">
            <MerchantDetails
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/listcoupokens">
            <ListCoupokens
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/listmerchants">
            <ListMerchants
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/setcoupon">
            <SetCoupon
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/setmerchant">
            <SetMerchant
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
