import { useState } from "react";
import { type SavedInbox } from "../hooks/useInbox";

type OTPState = "idle" | "waiting" | "received" | "no_otp";

type Props = {
    currentSite: string;
    activeInbox: SavedInbox | null;
    otpState: OTPState;
    otp: string | null;
    rawMessage: string | null;
    loading: boolean;
    error: string | null;
    onGenerate: () => void;
    onRefresh: () => void;
};

export default function OTPListener({
    currentSite,
    activeInbox,
    otpState,
    otp,
    rawMessage,
    loading,
    error,
    onGenerate,
    onRefresh,
}: Props) {
    const [copied, setCopied] = useState<Record<string, boolean>>({});
    const [showRaw, setShowRaw] = useState(false);

    const copy = (text: string, btnId: string) => {
        navigator.clipboard.writeText(text);
        setCopied(prev => ({ ...prev, [btnId]: true }));
        setTimeout(() => setCopied(prev => ({ ...prev, [btnId]: false })), 1500);
    };

    return (
        <div className="flex flex-col gap-3 p-3.5">
            {currentSite && (
                <div className="flex items-center gap-2 px-2.5 py-2 bg-black/5 rounded-lg border border-black/10">
                    <div className="w-[18px] h-[18px] rounded-[4px] bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-medium text-white">
                            {currentSite[0].toUpperCase()}
                        </span>
                    </div>
                    <span className="text-[12px] text-black/50">
                        Detected: <span className="text-[#111] font-medium">{currentSite}</span>
                    </span>
                </div>
            )}

            {activeInbox && (
                <div>
                    <p className="text-[11px] text-black/40 mb-1">Inbox address</p>
                    <div className="flex gap-2">
                        <div className="flex-1 h-[34px] rounded-lg border border-black/20 bg-black/5 px-2.5 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap">
                            {activeInbox.email_address}
                        </div>
                        <button
                            onClick={() => copy(activeInbox.email_address, "emailAddress")}
                            className="h-[34px] px-3 rounded-lg border border-black/20 text-[12px] text-black/60 hover:bg-black/5 transition-colors"
                        >
                            {copied["emailAddress"] ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-[11px] text-red-500">{error}</p>
            )}

            {otpState === "idle" && (
                <>
                    {activeInbox && (
                        <div className="flex items-center gap-2 text-[11px] text-black/30">
                            <div className="flex-1 h-px bg-black/10" />
                            or
                            <div className="flex-1 h-px bg-black/10" />
                        </div>
                    )}
                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className="h-[34px] px-3 mx-auto rounded-lg bg-[#111] text-white text-[12px] font-medium w-fit hover:bg-[#333] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Creating inbox..." : "+ Generate new inbox"}
                    </button>
                </>
            )}

            {otpState === "waiting" && activeInbox && (
                <div className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
                            <span className="text-[11px] text-black/50">Listening for email</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="text-[11px] text-black/30 hover:text-black/60 transition-colors"
                        >
                            Force Refresh
                        </button>
                    </div>
                    <div className="px-3 py-5 text-center text-[12px] text-black/30 leading-relaxed">
                        Waiting for an email<br />at {activeInbox.email_address}
                    </div>
                </div>
            )}

            {otpState === "received" && otp && (
                <div className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <span className="text-[11px] text-black/50">OTP received · {currentSite}</span>
                        <div className="flex flex-row gap-1 items-center">
                            <svg ref={(spinIconRef) => {
                                spinIconRef?.addEventListener('click', function () {
                                    this.classList.add('animate-spin-once');
                                    setTimeout(() => {
                                        this.classList.remove('animate-spin-once');
                                    }, 600);
                                })
                            }} className="h-3 w-3 cursor-pointer transition-colors hover:text-gray-600" fill="none" id="refresh-icon" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                <polyline points="21 3 21 9 15 9"></polyline>
                            </svg>
                            <span className="text-[10px] text-black/30">just now</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-4">
                        <div>
                            <div className="font-mono text-[30px] font-medium tracking-[0.2em]">{otp}</div>
                            <div className="text-[10px] text-black/30 mt-1">tap to copy</div>
                        </div>
                        <button
                            onClick={() => copy(otp, "otp")}
                            className="h-[34px] px-3 rounded-lg bg-[#111] text-white text-[12px] hover:bg-[#333] transition-colors"
                        >
                            {copied["otp"] ? "Copied!" : "Copy OTP"}
                        </button>
                    </div>
                </div>
            )
            }

            {
                otpState === "no_otp" && (
                    <div className="border border-black/10 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[11px] text-black/50">Email received — no OTP found</span>
                            </div>
                            <button
                                onClick={onRefresh}
                                className="text-[11px] text-black/30 hover:text-black/60 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                        <div className="px-3 py-3 flex flex-col gap-2">
                            <p className="text-[12px] text-black/40 leading-relaxed">
                                We couldn't detect an OTP in the latest email.
                            </p>
                            {rawMessage && (
                                <>
                                    <button
                                        onClick={() => setShowRaw((p) => !p)}
                                        className="text-[11px] text-black/40 hover:text-black/70 underline underline-offset-2 text-left transition-colors"
                                    >
                                        {showRaw ? "Hide original message" : "View original message"}
                                    </button>
                                    {showRaw && (
                                        <div className="bg-black/5 rounded-lg p-2.5 text-[11px] font-mono text-black/50 leading-relaxed max-h-[120px] overflow-y-auto whitespace-pre-wrap break-words">
                                            {rawMessage}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}