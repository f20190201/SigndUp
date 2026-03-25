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
            <p className="text-[11px] text-black/40">Inbox address</p>
            {loading ? <div className="flex flex-col gap-2"><InputAndCopyBtnShimmer /> <InputAndCopyBtnShimmer /></div> : activeInbox && (
                <>
                    <div>

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

                    <div>

                        <div className="flex gap-2">
                            <div className="flex-1 h-[34px] rounded-lg border border-black/20 bg-black/5 px-2.5 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap">
                                {showPassword ? decryptPassword(activeInbox.password, userId) : "••••••••••••"}
                            </div>
                            <button
                                onClick={() => setShowPassword(prev => !prev)}
                                className={actionBtnClassName}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                            <button
                                onClick={() => copy(decryptPassword(activeInbox.password, userId), "password")}
                                className={actionBtnClassName}
                            >
                                {copied["password"] ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <RenderIf condition={!!error}>
                <p className="text-[11px] text-red-500">{error}</p>
            </RenderIf>

            {otpState === "waiting" && activeInbox && (
                <div className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
                            <span className="text-[11px] text-black/50">Listening for email</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="text-[11px] text-black/30 hover:text-black/60 transition-colors cursor-pointer active:scale-95 active:text-black/60"
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
                        <span className="text-[11px] text-black/50">OTP received at {new Date(otpTimestamp || "--").toLocaleString()}</span>
                        <div className="flex flex-row gap-1 items-center">
                            <svg onClick={() => onRefresh()} ref={(spinIconRef) => {
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
                    <ViewOriginalMessage rawMessage={rawMessage} showRaw={showRaw} setShowRaw={setShowRaw} />
                </div>
            )
            }
            <RenderIf condition={otpState === "no_otp"}>
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
                        <ViewOriginalMessage rawMessage={rawMessage} showRaw={showRaw} setShowRaw={setShowRaw} />
                    </div>
                </div>
            </RenderIf>

            <>
                <RenderIf condition={!!activeInbox}>
                    <div className="flex items-center gap-2 text-[11px] text-black/30">
                        <div className="flex-1 h-px bg-black/10" />
                        or
                        <div className="flex-1 h-px bg-black/10" />
                    </div>
                </RenderIf>
                <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="h-[34px] px-3 mx-auto rounded-lg bg-[#111] text-white text-[12px] font-medium w-fit hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                    {loading ? "Creating inbox..." : "+ Generate new inbox"}
                </button>
            </>
        </div >
    );
}

export default memo(OTPListener);