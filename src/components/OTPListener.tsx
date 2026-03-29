import { useEffect, useState, memo } from "react";
import { type SavedInbox } from "../hooks/useInbox";
import InputAndCopyBtnShimmer from "./library/InputAndCopyBtnShimmer";
import { decryptPassword } from "../lib/crypto";
import ViewOriginalMessage from "./library/ViewOriginalMessage";
import RenderIf from "./library/RenderIf";

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
    userId: string;
    onSelect: (inbox: SavedInbox) => void;
    otpTimestamp: string | null;
};

const actionBtnClassName = "h-[34px] px-3 rounded-lg border border-black/20 text-[12px] text-black/60 hover:bg-black/5 transition-colors"

function OTPListener({
    currentSite,
    activeInbox,
    otpState,
    otp,
    rawMessage,
    loading,
    error,
    onGenerate,
    onRefresh,
    userId,
    onSelect,
    otpTimestamp
}: Props) {
    const [copied, setCopied] = useState<Record<string, boolean>>({});
    const [showRaw, setShowRaw] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (activeInbox && otpState === "idle") {
            onSelect(activeInbox);
        }
    }, [activeInbox])

    const copy = (text: string, btnId: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(prev => ({ ...prev, [btnId]: true }));
            setTimeout(() => setCopied(prev => ({ ...prev, [btnId]: false })), 1500);
        })
    };

    return (
        <div className="flex flex-col gap-3.5 p-4 animate-in">
            {currentSite && (
                <div className="flex items-center gap-2.5 px-3 py-2 bg-black/5 rounded-xl border border-black/5 transition-all hover:bg-black/[0.07]">
                    <div className="w-[20px] h-[20px] rounded-md bg-black flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[10px] font-bold text-white">
                            {currentSite[0].toUpperCase()}
                        </span>
                    </div>
                    <span className="text-[12px] text-black/50 font-medium">
                        Detected: <span className="text-black">{currentSite}</span>
                    </span>
                </div>
            )}
            
            <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-black/30 ml-1">Inbox address</p>
                {loading ? (
                    <div className="flex flex-col gap-2 opacity-50"><InputAndCopyBtnShimmer /> <InputAndCopyBtnShimmer /></div>
                ) : activeInbox && (
                    <div className="space-y-2">
                        <div className="flex gap-2 group">
                            <div className="flex-1 h-[36px] rounded-xl border border-black/5 bg-black/5 px-3 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap text-black/70 group-hover:bg-black/[0.07] transition-colors">
                                {activeInbox.email_address}
                            </div>
                            <button
                                onClick={() => copy(activeInbox.email_address, "emailAddress")}
                                className="h-[36px] px-4 rounded-xl border border-black/10 text-[12px] font-medium text-black/60 hover:bg-black hover:text-white transition-all active-shrink"
                            >
                                {copied["emailAddress"] ? "Copied!" : "Copy"}
                            </button>
                        </div>

                        <div className="flex gap-2 group">
                            <div className="flex-1 h-[36px] rounded-xl border border-black/5 bg-black/5 px-3 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap group-hover:bg-black/[0.07] transition-colors">
                                {showPassword ? decryptPassword(activeInbox.password, userId) : "••••••••••••"}
                            </div>
                            <button
                                onClick={() => setShowPassword(prev => !prev)}
                                className="h-[36px] px-3 rounded-xl border border-black/10 text-[12px] font-medium text-black/50 hover:bg-black/5 transition-colors active-shrink"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                            <button
                                onClick={() => copy(decryptPassword(activeInbox.password, userId), "password")}
                                className="h-[36px] px-4 rounded-xl border border-black/10 text-[12px] font-medium text-black/60 hover:bg-black hover:text-white transition-all active-shrink"
                            >
                                {copied["password"] ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <RenderIf condition={!!error}>
                <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>
            </RenderIf>

            {otpState === "waiting" && activeInbox && (
                <div className="border border-black/5 rounded-2xl overflow-hidden bg-black/[0.02] animate-in shadow-sm">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/5 border-b border-black/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <span className="text-[11px] font-medium text-black/60">Listening for email</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="text-[10px] font-bold uppercase tracking-tight text-black/30 hover:text-black transition-colors px-1"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="px-4 py-8 text-center text-[13px] text-black/40 font-medium leading-relaxed">
                        Waiting for an email at<br />
                        <span className="text-black/60 font-mono text-[11px]">{activeInbox.email_address}</span>
                    </div>
                </div>
            )}

            {otpState === "received" && otp && (
                <div className="border border-black/5 rounded-2xl overflow-hidden bg-white shadow-md animate-in ring-1 ring-black/[0.03]">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/5 border-b border-black/5">
                        <span className="text-[11px] font-medium text-black/40">OTP Received · {new Date(otpTimestamp || "--").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button onClick={onRefresh} className="hover:rotate-180 transition-transform duration-500 p-1">
                            <svg className="h-3.5 w-3.5 text-black/30 hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="21 3 21 9 15 9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-between px-5 py-6">
                        <div className="cursor-pointer group" onClick={() => copy(otp, "otp")}>
                            <div className="font-mono text-[36px] font-bold tracking-[0.2em] text-black transition-transform group-active:scale-95">{otp}</div>
                            <div className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-1">tap to copy code</div>
                        </div>
                        <button
                            onClick={() => copy(otp, "otp")}
                            className="h-[40px] px-5 rounded-xl bg-black text-white text-[12px] font-bold hover:bg-black/80 transition-all shadow-lg shadow-black/10 active-shrink"
                        >
                            {copied["otp"] ? "Copied!" : "Copy OTP"}
                        </button>
                    </div>
                    <ViewOriginalMessage rawMessage={rawMessage} showRaw={showRaw} setShowRaw={setShowRaw} />
                </div>
            )}

            <RenderIf condition={otpState === "no_otp"}>
                <div className="border border-black/5 rounded-2xl overflow-hidden bg-amber-50/30 animate-in">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50 border-b border-amber-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                            <span className="text-[11px] font-medium text-amber-900/60">Email received — no OTP found</span>
                        </div>
                    </div>
                    <div className="px-4 py-4 flex flex-col gap-3">
                        <p className="text-[12px] text-amber-900/50 font-medium leading-relaxed">
                            We detected a new email, but couldn't find a verification code inside.
                        </p>
                        <ViewOriginalMessage rawMessage={rawMessage} showRaw={showRaw} setShowRaw={setShowRaw} />
                    </div>
                </div>
            </RenderIf>

            <div className="pt-2 flex flex-col items-center gap-4">
                <RenderIf condition={!!activeInbox}>
                    <div className="flex items-center gap-3 w-full px-4">
                        <div className="flex-1 h-px bg-black/[0.04]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">or</span>
                        <div className="flex-1 h-px bg-black/[0.04]" />
                    </div>
                </RenderIf>
                <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="h-[42px] px-6 rounded-2xl bg-black text-white text-[13px] font-bold hover:bg-black/80 transition-all shadow-lg shadow-black/10 disabled:opacity-50 active-shrink flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="dot-loader"><span></span><span></span><span></span></div>
                            <span className="ml-1">Creating...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg leading-none mt-[-2px]">+</span>
                            <span>Generate new inbox</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default memo(OTPListener);