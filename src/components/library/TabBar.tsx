import { memo } from "react";
import IconMail from "./IconMail";
import IconList from "./IconList";

export type Tab = "otp" | "creds";

const TabBar = memo(function ({ activeTab, onChange }: { activeTab: Tab; onChange: (t: Tab) => void }) {
    return (
        <div className="flex border-b border-black/10">
            {(["otp", "creds"] as Tab[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => onChange(tab)}
                    className={`flex-1 h-10 flex items-center cursor-pointer justify-center gap-1.5 text-[12px] border-b-[1.5px] transition-colors ${activeTab === tab
                        ? "text-[#111] border-[#111] font-medium"
                        : "text-black/40 border-transparent"
                        }`}
                >
                    {tab === "otp" ? <IconMail /> : <IconList />}
                    {tab === "otp" ? "Get OTP" : "Saved creds"}
                </button>
            ))}
        </div>
    );
})

export default TabBar;