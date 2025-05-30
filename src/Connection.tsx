type ConnectionProps = {
  name: string;
  from: number;
  to: number;
  value: number;
}
export default function Connection ({name, from, to, value}: ConnectionProps){
     return <div className='connection'>
      <div>
        name: {name}
      </div>
      <div>
        from: {from} &rarr; ({value}) &rarr; to: {to}
      </div>
    </div>
}