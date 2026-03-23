import { useState } from "react";

type OTPState = "idle" | "waiting" | "received";

export default function OTPListener() {
    const [otpState, setOtpState] = useState<OTPState>("idle");
    const [email] = useState("ghostfox91@mail.tm");
    const [otp] = useState("482 910");
    const [copied, setCopied] = useState(false);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex flex-col gap-3 p-3.5">
            <div className="flex items-center gap-2 px-2.5 py-2 bg-black/5 rounded-lg border border-black/10">
                <div className="w-[18px] h-[18px] rounded-[4px] bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-medium text-white">G</span>
                </div>
                <span className="text-[12px] text-black/50">
                    Detected: <span className="text-[#111] font-medium">github.com</span>
                </span>
            </div>

            <div>
                <p className="text-[11px] text-black/40 mb-1">Inbox address</p>
                <div className="flex gap-2">
                    <div className="flex-1 h-[34px] rounded-lg border border-black/20 bg-black/5 px-2.5 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap">
                        {email}
                    </div>
                    <button
                        onClick={() => copy(email)}
                        className="h-[34px] px-3 rounded-lg border border-black/20 text-[12px] text-black/60 hover:bg-black/5 transition-colors"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {otpState === "idle" && (
                <>
                    <div className="flex items-center gap-2 text-[11px] text-black/30">
                        <div className="flex-1 h-px bg-black/10" />
                        or
                        <div className="flex-1 h-px bg-black/10" />
                    </div>
                    <button
                        onClick={() => setOtpState("waiting")}
                        className="h-[34px] px-3 rounded-lg bg-[#111] text-white text-[12px] font-medium w-fit hover:bg-[#333] transition-colors"
                    >
                        + Generate new inbox
                    </button>
                </>
            )}

            {otpState === "waiting" && (
                <div className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-700 animate-pulse" />
                            <span className="text-[11px] text-black/50">Listening for email</span>
                        </div>
                        <button
                            onClick={() => setOtpState("received")}
                            className="text-[10px] text-black/30 hover:text-black/60"
                        >
                            simulate →
                        </button>
                    </div>
                    <div className="px-3 py-5 text-center text-[12px] text-black/30 leading-relaxed">
                        Waiting for an email<br />at {email}
                    </div>
                </div>
            )}

            {otpState === "received" && (
                <div className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <span className="text-[11px] text-black/50">OTP received · GitHub</span>
                        <span className="text-[10px] text-black/30">just now</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-4">
                        <div>
                            <div className="font-mono text-[30px] font-medium tracking-[0.2em]">{otp}</div>
                            <div className="text-[10px] text-black/30 mt-1">expires in 10 min</div>
                        </div>
                        <button
                            onClick={() => copy(otp.replace(" ", ""))}
                            className="h-[34px] px-3 rounded-lg bg-[#111] text-white text-[12px] hover:bg-[#333] transition-colors"
                        >
                            {copied ? "Copied!" : "Copy OTP"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}