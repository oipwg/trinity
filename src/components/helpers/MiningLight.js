import React from 'react';

const MiningLight = ({mining, autoRent}) => {
    console.log('mining, autoRent:', mining, autoRent)
    return (
        <span className="renting-light-container">
            <p>Mining</p>
            <svg viewBox="0 0 134 134" width="50" height="50">
                <style type="text/css">{
                    ".st0{fill:url(#SVGID_1_);}" +
                    ".st1{fill:url(#SVGID_2_);}" +
                    ".st2{fill:url(#SVGID_3_);}" +
                    ".st3{fill:url(#green-glow_1_);}" +
                    ".st4{fill:#FF3600;}" +
                    ".st5{fill:url(#SVGID_4_);}" +
                    ".st6{fill:url(#SVGID_5_);}" +
                    ".st7{fill:url(#bulb-top-hightlight_1_);}"
                }</style>
                <g id="outter-shadow">
                    <radialGradient id="SVGID_1_" cx="-475.6171" cy="1244.5013" r="51.42" fx="-507.3624" fy="1273.3612" gradientTransform="matrix(-0.5452 0.8383 0.9221 0.5997 -1341.6274 -308.4312)" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#828282" />
                        <stop offset="1" stopColor="#000000" />
                    </radialGradient>
                    <path className="st0" d="M87.9,28.3c-21.4-11.6-48.1-3.6-59.6,17.8s-3.6,48.1,17.8,59.6s48.1,3.6,59.6-17.8c0,0,0,0,0,0
                             C117.2,66.5,109.3,39.9,87.9,28.3z M50.1,98.3C32.8,89,26.4,67.4,35.7,50.2s30.9-23.7,48.1-14.4c17.3,9.3,23.7,30.9,14.4,48.1
                             C88.9,101.2,67.4,107.6,50.1,98.3L50.1,98.3z"/>
                </g>
                <g id="ring-inner-shadow">
                    <radialGradient id="SVGID_2_" cx="239.8466" cy="487.8054" r="42.95" fx="239.8508" fy="487.8011" gradientTransform="matrix(0.8115 0.5844 0.5844 -0.8115 -412.775 343.5056)" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#828282" />
                        <stop offset="1" stopColor="#000000" />
                    </radialGradient>
                    <path className="st1" d="M88.2,37.5c-16.3-11.7-39-8-50.7,8.2s-8,39,8.2,50.7s39,8,50.7-8.2c0,0,0,0,0,0
                             C108.2,71.9,104.5,49.2,88.2,37.5z M48.7,92.4c-14.1-10.1-17.2-29.7-7.1-43.8s29.7-17.2,43.8-7.1s17.2,29.7,7.1,43.8c0,0,0,0,0,0
                             C82.3,99.4,62.7,102.6,48.7,92.4z"/>
                </g>
                <g id="green-bulb">
                    <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="66.3183" y1="43.26" x2="67.6683" y2="94.07" gradientTransform="matrix(1 0 0 -1 -4.134885e-03 135.9977)">
                        <stop offset="0" stopColor="#79AA00" />
                        <stop offset="1" stopColor="#307F00" />
                    </linearGradient>
                    <circle className="st2" cx="67" cy="67" r="31.3" />

                    <radialGradient id="green-glow_1_" cx="67" cy="69" r="41.76" gradientTransform="matrix(1 0 0 -1 0 136)" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#79E100" />
                        <stop offset="0.3612" stopColor="#4DED00" stopOpacity="0.6966" />
                        <stop offset="0.7864" stopColor="#1FFA00" stopOpacity="0.3394" />
                        <stop offset="1" stopColor="#0DFF00" stopOpacity="0.16" />
                    </radialGradient>
                    <circle className={mining && autoRent ? "green-glow st3 ledBulb" : "green-glow st3"} cx="67" cy="67" r="41.8" />
                </g>
                <g className="red-bulb" style={{ display: mining && autoRent ? 'none' : 'block' }}>
                    <circle className="st4" cx="67" cy="67" r="31.3" />
                    <radialGradient id="SVGID_4_" cx="66.9954" cy="69.0035" r="31.3547" gradientTransform="matrix(1 0 0 -1 8.765546e-03 136.0075)" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#FF8800" />
                        <stop offset="0.19" stopColor="#FF7A00" stopOpacity="0.83" />
                        <stop offset="0.62" stopColor="#FF5600" stopOpacity="0.39" />
                        <stop offset="1" stopColor="#FF3600" stopOpacity="0" />
                    </radialGradient>
                    <circle className="st5" cx="67" cy="67" r="31.4" />
                </g>
                <g id="bulb-bottom-highlight">
                    <linearGradient id="SVGID_5_" gradientUnits="userSpaceOnUse" x1="67" y1="39.2391" x2="67" y2="51.1" gradientTransform="matrix(1 0 0 -1 0 136)">
                        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
                        <stop offset="1" stopColor="#FDF0EC" stopOpacity="0" />
                    </linearGradient>
                    <path className="st6" d="M89.8,84.9c-8.8,12.6-26.1,15.6-38.7,6.8c-2.7-1.9-5-4.2-6.8-6.8H89.8z" />
                </g>
                <linearGradient id="bulb-top-hightlight_1_" gradientUnits="userSpaceOnUse" x1="66.91" y1="74.22" x2="66.91" y2="98.98" gradientTransform="matrix(1 0 0 -1 0 136)">
                    <stop offset="0" stopColor="#FDF0EC" stopOpacity="0" />
                    <stop offset="0.11" stopColor="#FDF0ED" stopOpacity="2.000000e-02" />
                    <stop offset="0.25" stopColor="#FDF2EE" stopOpacity="9.000000e-02" />
                    <stop offset="0.42" stopColor="#FDF4F1" stopOpacity="0.2" />
                    <stop offset="0.59" stopColor="#FEF7F4" stopOpacity="0.35" />
                    <stop offset="0.79" stopColor="#FEFAF9" stopOpacity="0.55" />
                    <stop offset="0.98" stopColor="#FFFFFF" stopOpacity="0.78" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.8" />
                </linearGradient>
                <ellipse id="bulb-top-hightlight" className="st7" cx="66.9" cy="49.4" rx="21" ry="12.4" />
            </svg>
        </span>
    )
}

export default MiningLight