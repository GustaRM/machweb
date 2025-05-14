import { useState } from 'react'
import './App.css'
import Pool from './Pool'

function App() {
  const [pool, setPool] = useState({ value: 0, name: "coins" })

  return (
    <>
    
    <Pool name="Pool A" value={1} />
    <Pool name="Pool B" value={2} />
    <Pool name="Pool C" value={3} />
    <Pool name="Pool D" value={4} />
   
</>

  )
}

export default App
