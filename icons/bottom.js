import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <defs>
      <path id="a" d="M0 0h16v16H0z" />
    </defs>
    <g>
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <g mask="url(#b)">
        <path
          d="M8 0 4 4 0 0"
          style={{
            stroke: "#333",
            strokeWidth: 1.3333333333333333,
            strokeOpacity: 1,
            strokeDasharray: "0 0",
          }}
          transform="translate(4 4)"
        />
        <path
          d="M8 0 4 4 0 0"
          style={{
            stroke: "#333",
            strokeWidth: 1.3333333333333333,
            strokeOpacity: 1,
            strokeDasharray: "0 0",
          }}
          transform="translate(4 8)"
        />
      </g>
    </g>
  </svg>
)
export default SvgComponent
