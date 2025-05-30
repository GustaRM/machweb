import { useState } from 'react'
import './App.css'
import Pool from './Pool'

function App() {
  const [pools, setPools] = useState([
    { value: 10, name: "coins" },
    { value: 5, name: "potions" },
    { value: 1, name: "Pool A" },
    { value: 2, name: "Pool B" },
    { value: 3, name: "Pool C" },
    { value: 4, name: "Pool D" }])

  return (
    <>
      {pools.map((pool) => { return <Pool key={pool.name} name={pool.name} value={pool.value} /> })}
      <button onClick={() => {
        const novoPools = [...pools];
        novoPools[0].value++;
        novoPools[1].value--;
        setPools(novoPools);
      }}>
        Aumenta
      </button>

    </>

  )
}

export default App
