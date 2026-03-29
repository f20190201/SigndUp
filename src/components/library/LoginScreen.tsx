import { memo, useState } from "react";

import UserIdInput from "./UserIdInput";
import PasswordInput from "./PasswordInput";
import Logo from "./Logo";
import type { AuthState } from "../../utils/generic-utils";

const LoginScreen = memo(function ({ onLogin, authState }: { onLogin: (id: string, password: string, setIsLoginLoading: (value: boolean) => void) => void, authState: AuthState | null }) {
    const [credsObj, setCredsObj] = useState({ userId: "", password: "" });
    const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-black/5 m-2.5 overflow-hidden shadow-2xl animate-in glass ring-1 ring-black/[0.03]">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-black/[0.02]">
                <Logo />
                <div>
                    <h1 className="text-[15px] font-bold tracking-tight leading-none text-black">SigndUp</h1>
                    <p className="text-[11px] font-medium text-black/30 mt-1">Disposable inboxes for secure signups</p>
                </div>
            </div>

            <div className="flex flex-col gap-5 px-6 pt-8 pb-7">
                <div className="space-y-1.5">
                    <h2 className="text-[18px] font-bold tracking-tight text-black text-center">Welcome</h2>
                    <p className="text-[13px] text-black/40 font-medium leading-relaxed text-center px-2">
                        Enter your credentials to access your saved inboxes and passwords.
                    </p>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                    <div className="space-y-1">
                        <UserIdInput
                            value={credsObj.userId}
                            onChange={(value) => setCredsObj({ ...credsObj, userId: value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <PasswordInput
                            value={credsObj.password}
                            onChange={(value) => setCredsObj({ ...credsObj, password: value })}
                            error={authState?.status === "error" ? authState.message : ""}
                        />
                        <p className="text-[10px] text-black/20 font-medium px-1">Must be at least 6 characters</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        credsObj.userId.trim() && credsObj.password.trim() && onLogin(credsObj.userId.trim(), credsObj.password.trim(), setIsLoginLoading);
                    }}
                    disabled={credsObj.password.trim().length < 6 || isLoginLoading}
                    className="h-11 rounded-2xl bg-black text-white text-[13px] font-bold hover:bg-black/80 transition-all w-full shadow-lg shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed active-shrink flex items-center justify-center"
                >
                    {isLoginLoading ? (
                        <div className="dot-loader"><span></span><span></span><span></span></div>
                    ) : "Continue"}
                </button>

                <div className="pt-2">
                    <p className="text-[11px] text-black/30 font-medium text-center bg-black/[0.03] py-2 px-3 rounded-xl border border-black/5">
                        New here? An account will be created automatically on your first login.
                    </p>
                </div>
            </div>
        </div>
    );
})

export default LoginScreen;