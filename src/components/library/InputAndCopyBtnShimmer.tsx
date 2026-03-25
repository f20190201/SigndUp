import { memo } from "react";

function InputAndCopyBtnShimmer() {
    return (
        <div className="flex gap-2 animate-pulse">
            <div className="relative flex-1 h-[34px] rounded-lg border border-black/20 bg-black/5 overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
            </div>

            <div className="relative h-[34px] w-[60px] rounded-lg border border-black/20 bg-black/5 overflow-hidden">
                <div className="absolute inset-0 shimmer"></div>
            </div>
        </div>
    );
}

export default memo(InputAndCopyBtnShimmer);
