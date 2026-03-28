import { memo } from "react";


const Logo = memo(() => {
    return (
        <div className="w-[26px] h-[26px] rounded-[7px] bg-[#111] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4.5C2 3.12 3.12 2 4.5 2H7v10H4.5C3.12 12 2 10.88 2 9.5v-5z" fill="#f0f0f0" />
                <path d="M7 2h2.5C10.88 2 12 3.12 12 4.5v5C12 10.88 10.88 12 9.5 12H7V7" fill="#f0f0f0" opacity="0.4" />
            </svg>
        </div>
    );
})

export default Logo;