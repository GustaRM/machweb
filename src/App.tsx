import { useState } from 'react'
import './App.css'
import Pool from './Pool'

function App() {
  const [pools, setPools] = useState([{ value: 10, name: "coins" }, { value: 5, name: "potions" }])

  return (
    <>
      {pools.map((pool) => { return <Pool key={pool.name} name={pool.name} value={pool.value} /> })}

      <Pool name="Pool A" value={1} />

      <Pool name="Pool B" value={2} />
      <Pool name="Pool C" value={3} />
      <Pool name="Pool D" value={4} />
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
