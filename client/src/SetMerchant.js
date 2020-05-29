import React, { useState } from "react";
import { useForm } from "react-hook-form";
import UriBlock from "./components/UriBlock";

const SetMerchant = props => {
  const [stackId, setStackID] = useState(null);
  const { drizzle, drizzleState } = props;
  const { Coupoken } = drizzleState.contracts;

  const { register, handleSubmit, watch, errors } = useForm();
  const onSubmit = data => {
    setValue(data);
  };

  const setValue = value => {
    const contract = drizzle.contracts.Coupoken;
    console.log(contract.methods["createMerchant"]);
    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["createMerchant"].cacheSend(
      value.name,
      value.category,
      value.weburl,
      value.mURI,
      {
        from: drizzleState.accounts[0]
      }
    );
    // save the `stackId` for later reference
    setStackID(stackId);
  };

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Transaction status: ${transactions[txHash] &&
      transactions[txHash].status}`;
  };

  return (
    <section>
      <h2>Register Merchant</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="six columns">
            <label htmlFor="name">Name</label>
            <input
              name="name"
              className="u-full-width"
              ref={register({
                required: true,
                pattern: /^[A-Za-z]+$/i,
                maxLength: 40
              })}
            />
            {errors.name && <span>Use a valid input</span>}
          </div>
          <div className="six columns">
            <label htmlFor="name">Category</label>
            <input
              name="category"
              className="u-full-width"
              ref={register({
                required: true,
                pattern: /^[A-Za-z]+$/i,
                maxLength: 40
              })}
            />
            {errors.category && <span>Use a valid input</span>}
          </div>
        </div>
        <div className="row">
          <div className="u-full-width">
            <label htmlFor="weburl">Website</label>
            <input
              name="weburl"
              className="u-full-width"
              ref={register({ required: true, maxLength: 40 })}
            />
            {errors.weburl && <span>Use a valid input</span>}
          </div>
        </div>
        <div className="row">
          <div className="u-full-width">
            <label htmlFor="mURI">URI</label>
            <input
              name="mURI"
              className="u-full-width"
              placeholder="https://domain.com/myJson"
              ref={register({ required: true, maxLength: 140 })}
            />
            {errors.mURI && <span>Use a valid input</span>}
          </div>
        </div>
        <input className="button-primary" type="submit" value="Submit" />
      </form>
      <div>{getTxStatus()}</div>
      <UriBlock />
    </section>
  );
};

export default SetMerchant;
