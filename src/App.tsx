import { useState } from 'react'
import './App.css'
import Pool from './Pool'
import Connection from './Connection'


function App() {
  const [pools, setPools] = useState(
    new Map(
    [
    ["coins", { value: 10, name: "coins" }],
    ["potions", { value: 5, name: "potions" }],
    ["life", { value: 1, name: "life" }],
   ]))

  const [connections, setConnections] = useState([
    { name: "gasta", from: "coins", to: "potions", value: 1 },
    { name: "beber", from: "potions", to: "life", value: 2 }

  ])

  return (
    <>
      <h2>Connections</h2>
      {connections.map((connection) => { return <Connection key={connection.name} name={connection.name} from={connection.from} to={connection.to} value={connection.value} /> })}

      <h2>Pools</h2>
      {Array.from(pools.values()).map((pool) => { return <Pool key={pool.name} name={pool.name} value={pool.value} /> })}

      <button onClick={() => {
        for (let i = 0; i < connections.length; i++) {
          const connection = connections[i];
          const source = pools.get(connection.from);
          const target = pools.get(connection.to);
          if(!source || !target) return;
          const novoPools = new Map(pools);
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
