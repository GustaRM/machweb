import { useState } from 'react'
import './App.css'
import Pool from './Pool'

function App() {
  const [pool, setPool] = useState({ value: 10, name: "coins" })

  return (
    <>
    
    <Pool name={pool.name} value={pool.value} />
    <Pool name="Pool A" value={1} />

    <Pool name="Pool B" value={2} />
    <Pool name="Pool C" value={3} />
    <Pool name="Pool D" value={4} />
    <button onClick={()=>{
      setPool({...pool, value: pool.value + 1})
    }}>
      Aumenta
    </button>
   
</>

  )
}

export default App
