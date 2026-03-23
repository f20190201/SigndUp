import { useState } from "react";

const MOCK_CREDS = [
    { id: "1", email: "ghostfox91@mail.tm", password: "f3kP9xQm2z", createdAt: "today", active: true },
    { id: "2", email: "winter.lamp@mail.tm", password: "nR7wLqX4kT", createdAt: "3 days ago", active: false },
];

export default function SavedCreds() {
    const [revealed, setRevealed] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const toggleReveal = (id: string) => {
        setRevealed((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col gap-2.5 p-3.5">
            <div className="flex items-center gap-2 px-2.5 py-2 bg-black/5 rounded-lg border border-black/10 mb-1">
                <div className="w-[18px] h-[18px] rounded-[4px] bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-medium text-white">G</span>
                </div>
                <span className="text-[12px] text-black/50">
                    Saved creds for <span className="text-[#111] font-medium">github.com</span>
                </span>
            </div>

            {MOCK_CREDS.map((cred, i) => (
                <div key={cred.id} className="border border-black/10 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-black/10">
                        <span className="text-[11px] font-mono text-black/40">
                            #{i + 1} · {cred.createdAt}
                        </span>
                        {cred.active && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                active inbox
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 p-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-black/30">email</span>
                            <div className="flex gap-1.5">
                                <div className="flex-1 h-[30px] rounded-lg border border-black/10 bg-white px-2.5 flex items-center font-mono text-[12px] overflow-hidden whitespace-nowrap">
                                    {cred.email}
                                </div>
                                <button
                                    onClick={() => copy(cred.email, `email-${cred.id}`)}
                                    className="h-[30px] px-2.5 rounded-lg border border-black/10 text-[11px] text-black/40 hover:bg-black/5 transition-colors"
                                >
                                    {copied === `email-${cred.id}` ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-black/30">password</span>
                            <div className="flex gap-1.5">
                                <div className="flex-1 h-[30px] rounded-lg border border-black/10 bg-white px-2.5 flex items-center font-mono text-[12px] tracking-widest overflow-hidden whitespace-nowrap">
                                    {revealed.includes(cred.id) ? cred.password : "••••••••••••"}
                                </div>
                                <button
                                    onClick={() => toggleReveal(cred.id)}
                                    className="h-[30px] px-2.5 rounded-lg border border-black/10 text-[11px] text-black/40 hover:bg-black/5 transition-colors"
                                >
                                    {revealed.includes(cred.id) ? "Hide" : "Show"}
                                </button>
                                <button
                                    onClick={() => copy(cred.password, `pass-${cred.id}`)}
                                    className="h-[30px] px-2.5 rounded-lg border border-black/10 text-[11px] text-black/40 hover:bg-black/5 transition-colors"
                                >
                                    {copied === `pass-${cred.id}` ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}