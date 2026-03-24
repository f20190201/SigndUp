import { useState, useEffect } from "react";
import Header from "../components/Header";
import OTPListener from "../components/OTPListener";
import SavedCreds from "../components/SavedCreds";
import { useAuth } from "../hooks/useAuth";
import { useInbox } from "../hooks/useInbox";

type Tab = "otp" | "creds";

function LoginScreen({ onLogin }: { onLogin: (id: string) => void }) {
  const [value, setValue] = useState("");

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
          <label className="text-[11px] text-black/50">User ID</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="usr_k9x2mq74"
            className="h-8 rounded-lg border border-black/20 bg-black/5 px-3 text-[12px] font-mono tracking-wide outline-none focus:border-black/40 w-full"
          />
        </div>

        <button
          onClick={() => value.trim() && onLogin(value.trim())}
          className="h-8 rounded-lg bg-[#111] text-white text-[12px] font-medium hover:bg-[#333] transition-colors w-full"
        >
          Continue
        </button>

        <p className="text-[11px] text-black/30 text-center">
          No account? One is created on first use.
        </p>
      </div>
    </div>
  );
}

function TabBar({ activeTab, onChange }: { activeTab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex border-b border-black/10">
      {(["otp", "creds"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 h-10 flex items-center justify-center gap-1.5 text-[12px] border-b-[1.5px] transition-colors ${activeTab === tab
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
}

function Logo() {
  return (
    <div className="w-[26px] h-[26px] rounded-[7px] bg-[#111] flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4.5C2 3.12 3.12 2 4.5 2H7v10H4.5C3.12 12 2 10.88 2 9.5v-5z" fill="#f0f0f0" />
        <path d="M7 2h2.5C10.88 2 12 3.12 12 4.5v5C12 10.88 10.88 12 9.5 12H7V7" fill="#f0f0f0" opacity="0.4" />
      </svg>
    </div>
  );
}

function IconMail() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2.5" width="11" height="8" rx="1.5" />
      <path d="M1 4.5l5.5 3.5 5.5-3.5" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" />
      <path d="M4 5h5M4 7.5h3" />
    </svg>
  );
}

export default function Popup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [currentSite, setCurrentSite] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("otp");

  function detectSite(callback: (hostname: string) => void) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab?.url ?? "";

      if (!url || url.startsWith("chrome")) {
        callback("unknown");
        return;
      }

      try {
        const hostname = new URL(url).hostname;
        callback(hostname);
      } catch {
        callback("unknown");
      }
    });
  }

  function handleLogin(id: string) {
    setUserId(id);
    detectSite((hostname) => {
      setCurrentSite(hostname);
      setIsLoggedIn(true);
    });
  }

  const inbox = useInbox(userId, currentSite);

  useEffect(() => {
    if (isLoggedIn && currentSite) {
      inbox.fetchSavedInboxes();
    }
  }, [isLoggedIn, currentSite]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col bg-white rounded-xl border border-black/10 m-2 overflow-hidden">
      <Header userId={userId} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex-1">
        {activeTab === "otp" ? (
          <OTPListener
            currentSite={currentSite}
            activeInbox={inbox.activeInbox}
            otpState={inbox.otpState}
            otp={inbox.otp}
            rawMessage={inbox.rawMessage}
            loading={inbox.loading}
            error={inbox.error}
            onGenerate={inbox.generateNewInbox}
            onRefresh={inbox.refresh}
            userId={userId}
          />
        ) : (
          <SavedCreds
            currentSite={currentSite}
            savedInboxes={inbox.savedInboxes}
            activeInbox={inbox.activeInbox}
            onSelect={inbox.selectInbox}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}