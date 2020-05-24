import React, { useState, useEffect, Fragment } from 'react'
import SetMerchant from "./SetMerchant";
import SetCoupon from "./SetCoupon";
import ListMerchants from "./ListMerchants";
import ListCoupokens from "./ListCoupokens";

const App = props => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({drizzleState: null, loading: true})
  const { drizzle } = props

  useEffect(
    () => {
      const unsubscribe = drizzle.store.subscribe( () => {
        // every time the store updates, grab the state from drizzle
        const drizzleState = drizzle.store.getState()
        // check to see if it's ready, if so, update local component state
        if (drizzleState.drizzleStatus.initialized) {
          setDrizzleReadinessState({drizzleState: drizzleState, loading: false})
        }
      })
      return () => {
        unsubscribe()
      }
    }, [drizzle.store, drizzleReadinessState]
  )

  return (
    drizzleReadinessState.loading ?
      "Loading Drizzle..."
      :
      <Fragment>
        <h1>Coupoken</h1>
        <div>
          Coupoken allows merchants to receive investments directly from customers. The investment is expressed in the form of a coupon, a 721 token, which can be sold and / or transferred according to the merchant's choices.
          There is the possibility of selling them using the cryptocurrencies, or using oracles and adjusting the transfers according to more complex logics external to the ethereum blockchain.
        </div>
        <br />
        <SetMerchant drizzle={drizzle} drizzleState={drizzleReadinessState.drizzleState} />
        <SetCoupon drizzle={drizzle} drizzleState={drizzleReadinessState.drizzleState} />
        <ListMerchants drizzle={drizzle} drizzleState={drizzleReadinessState.drizzleState} />
        <ListCoupokens drizzle={drizzle} drizzleState={drizzleReadinessState.drizzleState} />
      </Fragment>
  )
}

export default App
