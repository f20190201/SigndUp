import { memo } from "react";

const RenderIf = memo(({ condition, fallback = null, children }: { condition: boolean; fallback?: React.ReactNode; children: React.ReactNode }) => {
    return condition ? children : fallback;
})

export default RenderIf;