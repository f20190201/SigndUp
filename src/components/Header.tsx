import Logout from "./library/Logout";

export default function Header({ userId, onLogout }: { userId: string | undefined, onLogout: () => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            <div className="flex items-center gap-2">
                <div className="w-[26px] h-[26px] rounded-[7px] bg-[#111] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4.5C2 3.12 3.12 2 4.5 2H7v10H4.5C3.12 12 2 10.88 2 9.5v-5z" fill="#f0f0f0" />
                        <path d="M7 2h2.5C10.88 2 12 3.12 12 4.5v5C12 10.88 10.88 12 9.5 12H7V7" fill="#f0f0f0" opacity="0.4" />
                    </svg>
                </div>
                <span className="text-sm font-medium tracking-tight">
                    Signd<span className="text-black/30 font-normal">Up</span>
                </span>
            </div>
            <div className="flex flex-row gap-2 items-center">
                <span className="text-[11px] font-mono text-black/50 bg-black/5 border border-black/10 rounded-full px-2.5 py-0.5">
                    {userId}
                </span>
                <Logout onLogout={onLogout} />
            </div>
        </div>
    );
}