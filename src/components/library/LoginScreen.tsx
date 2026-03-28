import { memo, useState } from "react";

import UserIdInput from "./UserIdInput";
import PasswordInput from "./PasswordInput";
import Logo from "./Logo";
import type { AuthState } from "../../utils/generic-utils";

const LoginScreen = memo(function ({ onLogin, authState }: { onLogin: (id: string, password: string, setIsLoginLoading: (value: boolean) => void) => void, authState: AuthState | null }) {
    const [credsObj, setCredsObj] = useState({ userId: "", password: "" });
    const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

    return (
        <div className="flex flex-col bg-white rounded-xl border border-black/10 m-2 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10">
                <Logo />
                <div>
                    <p className="text-[13px] font-medium tracking-tight leading-none">SigndUp</p>
                    <p className="text-[11px] text-black/40 mt-0.5">disposable inboxes for OTPs</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 px-4 pt-6 pb-5">
                <div className="text-center">
                    <h2 className="text-[16px] font-medium">Welcome back</h2>
                    <p className="text-[12px] text-black/50 mt-1 leading-relaxed">
                        Enter your user ID to access your saved inboxes and creds.
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <UserIdInput
                        value={credsObj.userId}
                        onChange={(value) => setCredsObj({ ...credsObj, userId: value })}
                    />
                    <PasswordInput
                        value={credsObj.password}
                        onChange={(value) => setCredsObj({ ...credsObj, password: value })}
                        error={authState?.status === "error" ? authState.message : ""}
                    />
                </div>

                <button
                    onClick={() => {
                        credsObj.userId.trim() && credsObj.password.trim() && onLogin(credsObj.userId.trim(), credsObj.password.trim(), setIsLoginLoading);
                    }}
                    disabled={credsObj.password.trim().length < 6}
                    className="h-8 rounded-lg bg-[#111] text-white text-[12px] font-medium hover:bg-[#333] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#111]"
                >
                    {isLoginLoading ? "Loading..." : "Continue"}
                </button>

                <p className="text-[11px] text-black/30 text-center">
                    No account? One is created on first use.
                </p>
            </div>
        </div>
    );
})

export default LoginScreen;