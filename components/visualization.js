import Card from './card'
import Model from './model'

export default function Visualization(props) {
    return (<>
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <div className="grid col-span-3 items-center flex flex-1 justify-center">
            <Model 
              text={props.model}
              reasoning={props.reasoning}
            />
        </div>  
        </div>
    </>
        
    )
}