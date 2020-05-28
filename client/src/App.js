import React, { useState, useEffect, Fragment } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SetMerchant from "./SetMerchant";
import SetCoupon from "./SetCoupon";
import ListMerchants from "./ListMerchants";
import ListCoupokens from "./ListCoupokens";
import ListTrees from "./ListTrees";
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

  return drizzleReadinessState.loading ? (
    "Loading Drizzle..."
  ) : (
    <Router>
      <div>
        <h1>Devoleum - Coupoken</h1>
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

        <ul>
          <li>
            <Link to="/">List trees</Link>
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
        </ul>

        <hr />
        <br />
        <Switch>
          <Route exact path="/">
            <ListTrees
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route exact path="/myassets">
            <ListAssets
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
              address={drizzleReadinessState.drizzleState.accounts[0]}
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
