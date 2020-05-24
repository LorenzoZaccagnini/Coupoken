import React, { useState, useEffect } from "react"

const ListMerchants = props => {
  const [dataKey, setDataKey] = useState(null)
  const [merchantDetails, setMerchantDetails] = useState([])
  const { drizzle, drizzleState } = props
  const { Coupoken } = drizzleState.contracts

  useEffect(
    () => {
      getMerchantAdrs()
    }, [])

  const getMerchantAdrs = async () => {
    const contract = await drizzle.contracts.Coupoken
    const dataKey = await contract.methods["getMerchantList"].cacheCall()
    await setDataKey(dataKey)
    console.log("list m");
    console.log(dataKey);
    console.log(Coupoken.getMerchantList[dataKey]);

    //
    // for (var i = 1; i <= merchantAddressesList.value.length; i++) {
    //   const merchant = await contract.methods["getMerchantList"].cacheCall(i - 1)
    //   setMerchantDetails([...merchantDetails, merchant])
    // }
  }

  let merchantAddresses = Coupoken.getMerchantList[dataKey]

  return (
    // if it exists, then we display its value
    <div>
      <h2>List Merchants</h2>
      {merchantAddresses && merchantAddresses.value.map( item =>
        <div>
          {item}
        </div>

      )}
    </div>
  )
}

export default ListMerchants
