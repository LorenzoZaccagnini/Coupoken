import React, { useState } from "react"
import { useForm } from "react-hook-form";

const SetCoupon = props => {
  const [stackId, setStackID] = useState(null)
  const { drizzle, drizzleState } = props

  const { register, handleSubmit, watch, errors } = useForm();
  const onSubmit = data => {
    setValue(data)
  };


  const setValue = value => {
    const contract = drizzle.contracts.Coupoken
    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["createCoupon"].cacheSend(value.name, value.category, value.weburl, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId]

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Transaction status: ${transactions[txHash] && transactions[txHash].status}`
  }

  return (
    <div>
      <h2>Create Coupon</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="six columns">
            <label htmlFor="discount">Discount</label>
            <input name="discount" className="u-full-width" type="number" ref={register({ min: 1, max: 100 })} />
            {errors.name && <span>Use a valid input</span>}
          </div>
          <div className="six columns">
            <label htmlFor="price">Price</label>
            <input name="price" className="u-full-width" type="number" ref={register({ min: 1 })} />
            {errors.category && <span>Use a valid input</span>}
          </div>
        </div>
        Now: {Date.now()}
        <div className="row">
          <div className="six columns">
            <label htmlFor="deadline">Deadline Timestamp</label>
            <input name="deadline" placeholder={Date.now()} className="u-full-width" type="number" ref={register({ min: Date.now() })} />
            {errors.category && <span>Use a valid input</span>}
          </div>
          <div className="six columns">
            <label htmlFor="tokenid">Token ID</label>
            <input name="tokenid" className="u-full-width" type="number" ref={register({ min: 1})} />
            {errors.name && <span>Use a valid input</span>}
          </div>
        </div>
        <div className="row">
          <div className="u-full-width">
            <label htmlFor="uri">URI</label>
            <input name="uri" className="u-full-width" ref={register({ required: true, maxLength: 140 })} />
            {errors.weburl && <span>Use a valid input</span>}
            </div>
          </div>
        <input className="button-primary" type="submit" value="Submit" />
      </form>
      <div>{getTxStatus()}</div>
    </div>
  )
}

export default SetCoupon
