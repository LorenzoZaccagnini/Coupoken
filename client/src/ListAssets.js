import React, { useState, useEffect } from "react"

const ListAssets = props => {
  const [stackId, setStackID] = useState(null)
  const [dataKey, setDataKey] = useState(null)
  const [couponDetails, setCouponsDetails] = useState([])
  const { drizzle, drizzleState } = props
  const { Coupoken } = drizzleState.contracts

  useEffect(
    () => {
      getCoupons()
    }, [])

  const toggleLock = async (_tradable) => {
    const contract = await drizzle.contracts.Coupoken
    const stackId = contract.methods["toggleLockCoupon"].cacheSend(!_tradable, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }
  const getCoupons = async () => {
    const contract = await drizzle.contracts.Coupoken
    let result = await contract.methods.tokensOfOwner(drizzleState.accounts[0])
      .call({from: drizzleState.accounts[0]})
      console.log(result);
    for (const i of result) {
      console.log(i);
      let coupon = await contract.methods.getCouponInfo(i)
        .call({from: drizzleState.accounts[0]})
      let merchant = await contract.methods.getMerchantInfo(coupon.merchantAdr)
        .call({from: drizzleState.accounts[0]})
      let uri = await contract.methods.tokenURI(i)
        .call({from: drizzleState.accounts[0]})
      let response = await fetch(uri);
      console.log(response);
      let data = await response.json()
      console.log(data);
      coupon.id = i
      coupon.data = data
      coupon.uri = uri
      console.log(uri);
      coupon.merchantName = merchant.merchantName
      setCouponsDetails(couponDetails => [...couponDetails, coupon]);
    }
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
    // if it exists, then we display its value
    <section>
      <h2>Your Assets</h2>
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
                            item.tradable ?
                            <input class="button-primary u-full-width" type="button" value="Lock Asset" onClick={() => toggleLock(item.tradable)}/>
                            :
                            <input class="button-primary u-full-width" type="button" value="Unlock Asset" onClick={() => toggleLock(item.tradable)}/>
                          }
                      </div>
                  )}
              </div>
          }
    </section>
  )
}

export default ListAssets
