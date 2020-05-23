import React, { useState, useEffect } from "react"

const ListTokens = props => {
  const [tokens, setTokens] = useState(null)
  const { drizzle, drizzleState } = props
  const { Coupoken } = drizzleState.contracts

  useEffect(
    () => {

    }, [])

  const geTokens = () => {
    const contract = drizzle.contracts.Coupoken

    const totalSupply = await contract.methods.totalSupply().call()
    for (var i = 1; i <= totalSupply; i++) {
      const token = await contract.methods.colors(i - 1).call()
      setTokens([...tokens, token])
    }
  }



  return (
    // if it exists, then we display its value
    <p>My stored string: </p>
  )
}

export default Readstring
