import React, { useState, useEffect } from "react"
import {
  Link
} from "react-router-dom";


const ListTrees = props => {
  const [stackId, setStackID] = useState(null)
  const [dataKey, setDataKey] = useState(null)
  const [couponDetails, setCouponsDetails] = useState([])
  const { drizzle, drizzleState } = props
  const { Coupoken } = drizzleState.contracts

  useEffect(
    () => {
      getCoupons()
    }, [])

  const getCoupons = async () => {
    const contract = await drizzle.contracts.Coupoken
    let result = await contract.methods.totalSupply()
      .call({from: drizzleState.accounts[0]})
    for (var i = 1; i <= parseInt(result); i++) {
      let coupon = await contract.methods.getCouponInfo(i)
        .call({from: drizzleState.accounts[0]})
      coupon.owner = await contract.methods.ownerOf(i)
          .call({from: drizzleState.accounts[0]})
      if (coupon.tradable) {
        let merchant = await contract.methods.getMerchantInfo(coupon.merchantAdr)
          .call({from: drizzleState.accounts[0]})
        let uri = await contract.methods.tokenURI(i)
          .call({from: drizzleState.accounts[0]})
        let response = await fetch(uri);
        let data = await response.json()
        coupon.id = i
        coupon.data = data
        coupon.uri = uri
        coupon.merchantName = merchant.merchantName
        setCouponsDetails(couponDetails => [...couponDetails, coupon]);
      }

    }
  }

  const buyCoupon = async (price) => {
    const contract = await drizzle.contracts.Coupoken
    const stackId = contract.methods["buyCoupon"].cacheSend(price, {
      from: drizzleState.accounts[0],
      value: price
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
    getCoupons()
    // otherwise, return the transaction status
    return `Transaction status: ${transactions[txHash] && transactions[txHash].status}`
  }


  return (
    // if it exists, then we display its value
    <section>
      <h2>Adopt a tree</h2>
      {couponDetails &&
              <div className="token_container">
                  {
                    couponDetails.map( item =>
                      <div  className="token_box" key={item.id}>
                        <h4>{item.data.name}</h4>
                        <img src={item.data.image} />
                        <br />
                          <strong>Description</strong>
                          <div>{item.data.description.length > 160 ? item.data.description.substring(0,160) + "..." : item.data.description}</div>
                          <div className="row">
                                <div class="four columns">
                                  <strong>Merchant</strong>
                                  <div>{item.merchantName}</div>
                                </div>
                                <div class="four columns">
                                  <strong>Price</strong>
                                  <div>{item.price}</div>
                                </div>

                                <div class="four columns">
                                  <strong>Discount</strong>
                                  <div>{item.discountSize}</div>
                                </div>
                          </div>
                          <div className="row">
                              <div class="four columns">
                                <strong>Created</strong>
                                <div>{new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit'})
                                  .format(item.deadline * 1000)}
                                </div>
                              </div>
                              <div class="four columns">
                                <strong>Deadline</strong>
                                <div>{new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit'})
                                  .format(item.createdAt * 1000)}
                                </div>
                              </div>
                              <div class="four columns">
                                <strong>ID</strong>
                                <div>{item.id}</div>
                              </div>
                          </div>
                          <br />
                          {
                            item.owner === drizzleState.accounts[0] ?
                            <input class="button-primary u-full-width" type="button" value="You are the Owner" />
                            :
                            <input class="button-primary u-full-width" type="button" value="Buy" onClick={() => buyCoupon(item.price)}/>
                          }
                          <Link to={"/asset/" + item.id}>
                            <input class="u-full-width" type="button" value="Details" />
                          </Link>

                      </div>
                  )}
              </div>
          }
    </section>
  )
}

export default ListTrees
