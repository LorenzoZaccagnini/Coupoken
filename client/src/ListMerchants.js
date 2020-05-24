import React, { useState, useEffect } from "react"

const ListMerchants = props => {
  const [dataKey, setDataKey] = useState(null)
  const [merchantDetails, setMerchantDetails] = useState([])
  const { drizzle, drizzleState } = props
  const { Coupoken } = drizzleState.contracts

  useEffect(
    () => {
      getMerchants()
    }, [])

  const getMerchants = async () => {
    const contract = await drizzle.contracts.Coupoken
    let result = await contract.methods.getMerchantList()
      .call({from: drizzleState.accounts[0]})

    for (var i = 1; i <= result.length; i++) {
      console.log(result[i - 1]);
      let merchant = await contract.methods.getMerchantInfo(result[i - 1])
        .call({from: drizzleState.accounts[0]})
      merchant.address = result[i - 1];
      setMerchantDetails(merchantDetails => [...merchantDetails, merchant]);
    }
  }


  return (
    // if it exists, then we display its value
    <section>
      <h2>List Merchants</h2>
      {merchantDetails &&
          <table className="u-full-width">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>URI</th>
                </tr>
              </thead>
              <tbody>
                  {
                    merchantDetails.map( item =>
                      <tr key={item.address}>
                        <td>{item.merchantName}</td>
                        <td>{item.category}</td>
                        <td>{item.websiteUrl}</td>
                      </tr>
                  )}
              </tbody>
            </table>
          }
    </section>
  )
}

export default ListMerchants
