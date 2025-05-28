type PoolProps = {
  value: number;
  name: string;
}
export default function Pool ({value,name}: PoolProps){
     return <div className='pool'>
      <div>
        value: {value}
      </div>
      <div>
        name: {name}
      </div>
    </div>
}