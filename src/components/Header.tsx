import Logout from "./library/Logout";

export default function Header({ userId, onLogout }: { userId: string | undefined, onLogout: () => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
                <div className="w-[28px] h-[28px] rounded-lg bg-black flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105">
                    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4.5C2 3.12 3.12 2 4.5 2H7v10H4.5C3.12 12 2 10.88 2 9.5v-5z" fill="white" />
                        <path d="M7 2h2.5C10.88 2 12 3.12 12 4.5v5C12 10.88 10.88 12 9.5 12H7V7" fill="white" opacity="0.4" />
                    </svg>
                </div>
                <h1 className="text-[15px] font-semibold tracking-tight text-black flex items-center">
                    Signd<span className="text-black/30 font-medium">Up</span>
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center px-2 py-0.5 rounded-full bg-black/5 border border-black/5">
                    <span className="text-[10px] font-mono text-black/40 truncate max-w-[80px]">
                        {userId}
                    </span>
                </div>
                <Logout onLogout={onLogout} />
            </div>
        </div>
    );
}