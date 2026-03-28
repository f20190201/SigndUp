import { memo } from "react";

const IconList = memo(() => {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" />
            <path d="M4 5h5M4 7.5h3" />
        </svg>
    );
})

export default IconList;