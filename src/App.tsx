import { useState } from 'react'
import './App.css'
import Pool from './Pool'
import Connection from './Connection'


function App() {
  const [pools, setPools] = useState([
    { value: 10, name: "coins" },
    { value: 5, name: "potions" },
    { value: 1, name: "Pool A" },
    { value: 2, name: "Pool B" },
    { value: 3, name: "Pool C" },
    { value: 4, name: "Pool D" }])

  const [connections, setConnections] = useState([
    { name: "gasta", from: 0, to: 1, value: 1 },
    { name: "beber", from: 1, to: 5, value: 2 }

  ])

  return (
    <>
      <h2>Connections</h2>
      {connections.map((connection) => { return <Connection key={connection.name} name={connection.name} from={connection.from} to={connection.to} value={connection.value} /> })}

      <h2>Pools</h2>
      {pools.map((pool) => { return <Pool key={pool.name} name={pool.name} value={pool.value} /> })}

      <button onClick={() => {
        for (let i = 0; i < connections.length; i++) {
          const connection = connections[i];
          const source = pools[connection.from];
          const target = pools[connection.to];
          
          const novoPools = [...pools];
          source.value-= connection.value;
          target.value+= connection.value;
          setPools(novoPools);
        }
      }}>
        Tick
      </button>

    </>

  )
}

export default App
