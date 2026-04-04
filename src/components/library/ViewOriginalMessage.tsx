import { memo } from "react";

function ViewOriginalMessage({ rawMessage, showRaw, setShowRaw }: { rawMessage: string | null, showRaw: boolean, setShowRaw: (value: React.SetStateAction<boolean>) => void }) {

    if (!rawMessage) return null;

    return (

        <div className="m-2">
            <button
                onClick={() => setShowRaw((p) => !p)}
                className="text-[11px] text-black/40 hover:text-black/70 underline underline-offset-2 text-left transition-colors cursor-pointer"
            >
                {showRaw ? "Hide original message" : "View original message"}
            </button>
            {showRaw && (
                <div 
                    className="bg-black/5 rounded-lg p-2.5 text-[11px] font-mono text-black/50 leading-relaxed max-h-[120px] overflow-y-auto break-words"
                    dangerouslySetInnerHTML={{ __html: rawMessage }}
                />
            )}
        </div>
    )

}

export default memo(ViewOriginalMessage);