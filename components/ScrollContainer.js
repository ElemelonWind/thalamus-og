
import React, { useRef, useEffect, useLayoutEffect } from "react";

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

    useLayoutEffect(() => {
      console.log(innerRef.current.clientHeight);
    }, []);
  
    // scroll smoothly on change of children
    useEffect(() => {
      const outerHeight = outerRef.current.clientHeight;
      const innerHeight = innerRef.current.scrollHeight + innerRef.current.clientHeight + innerRef.current.offsetTop;
      console.log(innerHeight, outerHeight);
      if (innerHeight === lastInnerHeight) return;
        setLastInnerHeight(innerHeight);
  
      outerRef.current.scrollTo({
        top: innerHeight - outerHeight,
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
          overflowX: "hidden",
         }}
      >
        <div
          ref={innerRef}
          style={{
            position: "absolute",
            bottom: 0,
            paddingRight: "16px",
            overflowY: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column-reverse"
          }}
        >
          {/* children reversed */}
          {children}
        </div>
      </div>
    )
  };