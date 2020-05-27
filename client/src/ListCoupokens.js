import React, { useState, useEffect } from "react"

const ListCoupokens = props => {
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
      console.log(result);
    for (var i = 1; i <= parseInt(result); i++) {
      console.log(i);
      let coupon = await contract.methods.getCouponInfo(i)
        .call({from: drizzleState.accounts[0]})
      let merchant = await contract.methods.getMerchantInfo(coupon.merchantAdr)
        .call({from: drizzleState.accounts[0]})
      let uri = await contract.methods.tokenURI(i)
        .call({from: drizzleState.accounts[0]})
      coupon.id = i
      coupon.uri = uri
      console.log(uri);
      coupon.merchantName = merchant.merchantName
      setCouponsDetails(couponDetails => [...couponDetails, coupon]);
    }
  }


  return (
    // if it exists, then we display its value
    <section>
      <h2>List Coupokens</h2>
      {couponDetails &&
          <table className="u-full-width">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Discount</th>
                  <th>Price</th>
                  <th>Deadline</th>
                  <th>CreatedAt</th>
                  <th>Merchant</th>
                </tr>
              </thead>
              <tbody>
                  {
                    couponDetails.map( item =>
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.discountSize}</td>
                        <td>{item.price}</td>
                        <td>{new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit'})
                          .format(item.deadline * 1000)}
                        </td>
                        <td>{new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit'})
                          .format(item.createdAt * 1000)}
                        </td>
                        <td>{item.merchantName}</td>
                      </tr>
                  )}
              </tbody>
            </table>
          }
    </section>
  )
}

export default ListCoupokens
