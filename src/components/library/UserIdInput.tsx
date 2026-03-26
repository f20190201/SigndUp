import { memo } from "react";

const UserIdInput = memo(function ({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    return (
        <div className="w-full">
            <label className="text-[11px] text-black/50">User ID</label>
            <input
                type="text"
                value={value}
                name="user-id-input"
                onChange={(e) => onChange(e.target.value)}
                placeholder="usr_k9x2mq74"
                className="h-8 rounded-lg border border-black/20 bg-black/5 px-3 text-[12px] font-mono tracking-wide outline-none focus:border-black/40 w-full"
            />
        </div>
    );
})

export default UserIdInput;