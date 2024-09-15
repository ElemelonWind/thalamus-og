import Card from './card'
import Model from './model'

export default function Visualization(props) {
    return (<>
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <div className="grid col-span-3 items-center flex flex-1 justify-center">
            <Model 
              model={props.model}
              reasoning={props.reasoning}
            />
        </div>  
        <div className="grid col-span-1 items-center flex flex-1 justify-center">
          <Card 
            text={`arxiv: ${props.arxiv}`}
          />
        </div>
        <div className="grid col-span-1 items-center flex flex-1 justify-center">

        <Card 
            text={`web search: ${props.webSearch}`}
          />
        </div>
        <div className="grid col-span-1 items-center flex flex-1 justify-center">

        <Card 
            text={`csv search: ${props.csvSearch}`}
            />
        </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="grid col-span-1 items-center flex flex-1 justify-center">
        <Card
            text={`writing: ${props.writing}`}
          />
          </div>
          <div className="grid col-span-1 items-center flex flex-1 justify-center">

        <Card
            text={`math: ${props.math}`}
            />
            </div>
            </div>
            </>
        
    )
}