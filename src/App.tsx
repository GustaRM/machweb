import { useState } from 'react'
import './App.css'

function App() {
  const [pool, setPool] = useState({ value: 0, name: "coins" })


  return (
    <div className='pool'>
      <div>
        value: {pool.value}
      </div>
      <div>
        name: {pool.name}
      </div>
    </div>


  )
}

export default App
