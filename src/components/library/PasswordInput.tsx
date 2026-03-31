import { memo, useState } from "react";

const PasswordInput = memo(function ({ value, onChange, error }: { value: string, onChange: (value: string) => void, error: string }) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="w-full">
            <label className="text-[11px] text-black/50">Password</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    name="password-input"
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-full rounded-lg border border-black/20 bg-black/5 pl-3 pr-7 text-sm font-mono tracking-wide outline-none focus:border-black/40 focus:bg-white transition focus:shadow-sm"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 font-medium text-black/50 hover:text-black transition cursor-pointer"
                >
                    {showPassword ? "🙈" : "👁"}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
})

export default PasswordInput;