import { useState, memo, useRef } from "react";
import { type SavedInbox } from "../hooks/useInbox";
import { decryptPassword } from "../lib/crypto";
import PulseLoader from "./library/PulseLoader";
import { type ToastType } from "../hooks/useToast";
import UseBtn from "./library/UseBtn";

type Props = {
    currentSite: string;
    savedInboxes: SavedInbox[];
    activeInbox: SavedInbox | null;
    onSelect: (inbox: SavedInbox) => void;
    userId: string;
    onDelete: (emailId: string, showToast: (message: string, type: ToastType) => void) => Promise<void>;
    loading: boolean;
    showToast: (message: string, type: ToastType) => void;
};

const ActiveTag = memo(() => {
    return (
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
            active
        </span>
    )
})


function SavedCreds({
    currentSite,
    savedInboxes,
    activeInbox,
    onSelect,
    userId,
    onDelete,
    loading,
    showToast
}: Props) {
    const [revealed, setRevealed] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const deleteClickedIdx = useRef<number | null>(null);

    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        })
    };

    const toggleReveal = (id: string) => {
        setRevealed((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col gap-3 p-4 animate-in">
            {currentSite && (
                <div className="flex items-center gap-2.5 px-3 py-2 bg-black/5 rounded-xl border border-black/5 mb-1 transition-all hover:bg-black/[0.07]">
                    <div className="w-[20px] h-[20px] rounded-md bg-black flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[10px] font-bold text-white">
                            {currentSite[0].toUpperCase()}
                        </span>
                    </div>
                    <span className="text-[12px] text-black/40 font-medium">
                        Saved inboxes for <span className="text-black font-semibold">{currentSite}</span>
                    </span>
                </div>
            )}

            {savedInboxes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in">
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <p className="text-[13px] text-black/30 font-medium">
                        No saved inboxes for this site yet.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {savedInboxes.map((cred, i) => (
                    <div
                        key={cred.id}
                        className="group border border-black/5 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-in ring-1 ring-black/[0.02]"
                        style={{ animationDelay: `${i * 0.08}s` }}
                    >
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/[0.02] border-b border-black/5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-black/30">
                                {new Date(cred.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-2">
                                {activeInbox?.email_address === cred.email_address ? (
                                    <ActiveTag />
                                ) : (
                                    <>
                                        <UseBtn btnText="Use" onClick={() => onSelect(cred)} />
                                        <button
                                            onClick={() => {
                                                deleteClickedIdx.current = i;
                                                onDelete(cred.email_address, showToast).then(() => {
                                                    deleteClickedIdx.current = null;
                                                });
                                            }}
                                            className="text-[10px] uppercase font-bold tracking-tight text-red-500/40 hover:text-red-500 transition-colors p-1 active-shrink"
                                        >
                                            {loading && deleteClickedIdx.current === i ? <PulseLoader /> : "Delete"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 p-3.5">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-black/20 ml-1">Email</span>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-[34px] rounded-xl border border-black/5 bg-black/5 px-3 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap text-black/70">
                                        {cred.email_address}
                                    </div>
                                    <button
                                        onClick={() => copy(cred.email_address, `email-${cred.id}`)}
                                        className="h-[34px] px-3.5 rounded-xl border border-black/10 text-[11px] font-bold text-black/40 hover:bg-black hover:text-white transition-all active-shrink"
                                    >
                                        {copied === `email-${cred.id}` ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-black/20 ml-1">Password</span>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-[34px] rounded-xl border border-black/5 bg-black/5 px-3 flex items-center font-mono text-[12px] tracking-widest overflow-hidden whitespace-nowrap text-black/70">
                                        {revealed.includes(cred.id) ? decryptPassword(cred.password, userId) : "••••••••••••"}
                                    </div>
                                    <button
                                        onClick={() => toggleReveal(cred.id)}
                                        className="h-[34px] px-3 rounded-xl border border-black/10 text-[11px] font-bold text-black/40 hover:bg-black/5 transition-colors active-shrink"
                                    >
                                        {revealed.includes(cred.id) ? "Hide" : "Show"}
                                    </button>
                                    <button
                                        onClick={() => copy(decryptPassword(cred.password, userId), `pass-${cred.id}`)}
                                        className="h-[34px] px-3.5 rounded-xl border border-black/10 text-[11px] font-bold text-black/40 hover:bg-black hover:text-white transition-all active-shrink"
                                    >
                                        {copied === `pass-${cred.id}` ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(SavedCreds);
