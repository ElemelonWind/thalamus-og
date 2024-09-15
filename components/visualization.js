import Model from './model'
import BigModel from './bigmodel'
import LoadingIcon from "../icons/three-dots.js";
export default function Visualization(props) {
    

    return (        <div className="h-full flex flex-1 items-center justify-center">

    {props.models.length === 0 && (
            <LoadingIcon />
    )}
        {props.models.length !== 0 && (
            props.easy ? (
            <div className="pb-20">
                <BigModel 
              text={`Model: ${props.models[0].name}`}
              reasoning={props.models[0].reasoning}
            />
            </div>
            ):(<>
                <div className="grid grid-cols-2 gap-4 w-full mb-20">
            <div className="grid col-span-1 items-center flex flex-1 justify-center">
                <Model 
                    text={`${props.models[0].type}: ${props.models[0].name}`}
                    reasoning={props.models[0].reasoning}
                />
            </div>
            <div className="grid col-span-1 items-center flex flex-1 justify-center">
                <Model 
                    text={`Model: ${props.models[1].name}`}
                    reasoning={props.models[1].reasoning}
                />
            </div>
            <div className="grid col-span-2 items-center flex flex-1 justify-center">
            <Model 
                    text={`Model: ${props.models[2].name}`}
                    reasoning={props.models[2].reasoning}
                />
            </div>
            </div>
            </>
            ))
        }

</div>
        
    )
}