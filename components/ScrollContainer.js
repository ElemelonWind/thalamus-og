
import React, { useRef, useEffect } from "react";

export default function ScrollContainer({children}) {
    const outerRef = useRef(null);
    const innerRef = useRef(null);

    const [lastInnerHeight, setLastInnerHeight] = React.useState(0);
  
     // start the container at the bottom
    useEffect(() => {
      const outerHeight = outerRef.current.clientHeight;
      const innerHeight = innerRef.current.clientHeight;
      setLastInnerHeight(innerHeight);
  
      outerRef.current.scrollTo({
        top: innerHeight - outerHeight,
        left: 0
      });
    }, []);
  
    // scroll smoothly on change of children
    useEffect(() => {
      const outerHeight = outerRef.current.clientHeight;
      const innerHeight = innerRef.current.clientHeight;
      if (innerHeight === lastInnerHeight) return;
        setLastInnerHeight(innerHeight);
  
      outerRef.current.scrollTo({
        top: innerHeight - outerHeight + 32,
        left: 0,
      });
    }, [children]);
    
    return (
      <div
        ref={outerRef}
        style={{
          position: "relative", 
          height: "100%", 
          overflowY: "auto",
          overflowX: "hidden"
         }}
      >
        <div
          ref={innerRef}
          style={{
            position: "relative",
            scrollBehavior: "smooth",
            paddingRight: "16px",
          }}
        >
          {children}
        </div>
      </div>
    )
  };