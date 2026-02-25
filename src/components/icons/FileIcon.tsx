interface FileIconProps {
  type: string;
  tagColor: string;
}

export const FileIcon = ({ type, tagColor }: FileIconProps) => (
  <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip-file)">
      <path d="M8.09961 0.674805H19.9697L30.8252 11.5303V32.4004C30.825 34.0155 29.5155 35.325 27.9004 35.3252H8.09961C6.48449 35.325 5.17502 34.0155 5.1748 32.4004V3.59961C5.17502 1.98449 6.48449 0.675016 8.09961 0.674805Z" fill="white" stroke="#E8E5DF" strokeWidth="1.35"/>
      <path d="M19.7998 0.900002V9C19.7998 10.4912 21.0086 11.7 22.4998 11.7H30.5998" stroke="#E8E5DF" strokeWidth="1.35" strokeLinecap="round"/>
    </g>
    <rect y="16.9" width="22.5" height="14.6" rx="1.8" fill={tagColor}/>
    <text x="11.25" y="26.5" fill="white" fontFamily="Inter" fontWeight="700" fontSize="9" letterSpacing="-0.02em" textAnchor="middle" dominantBaseline="central" style={{ textTransform: "uppercase" as const }}>
      {type}
    </text>
    <defs>
      <clipPath id="clip-file">
        <rect width="27" height="36" fill="white" transform="translate(4.5)"/>
      </clipPath>
    </defs>
  </svg>
);
