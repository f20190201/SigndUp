import { memo } from "react";

const UseBtn = memo(({ btnText, onClick }: { btnText: string, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-black text-white hover:bg-black/80 transition-all active-shrink shadow-sm"
        >
            {btnText}
        </button>
    )
})

export default UseBtn;