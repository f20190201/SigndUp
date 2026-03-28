import { useState, useEffect, memo, useCallback, useRef } from "react";
import Header from "../components/Header";
import OTPListener from "../components/OTPListener";
import SavedCreds from "../components/SavedCreds";
import { useInbox } from "../hooks/useInbox";
import { encryptPassword, decryptPassword } from "../lib/crypto";
import { detectSite, validateLocalStorageInfo, handleSignUpSignIn, type AuthState, isValidSession, setSessionStatus } from "../utils/generic-utils";
import PasswordInput from "../components/library/PasswordInput";
import UserIdInput from "../components/library/UserIdInput";

type Tab = "otp" | "creds";

const LoginScreen = memo(function ({ onLogin, authState }: { onLogin: (id: string, password: string) => void, authState: AuthState | null }) {
  const [credsObj, setCredsObj] = useState({ userId: "", password: "" });

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
          onClick={() => credsObj.userId.trim() && credsObj.password.trim() && onLogin(credsObj.userId.trim(), credsObj.password.trim())}
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
})

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


const Logo = memo(() => {
  return (
    <div className="w-[26px] h-[26px] rounded-[7px] bg-[#111] flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4.5C2 3.12 3.12 2 4.5 2H7v10H4.5C3.12 12 2 10.88 2 9.5v-5z" fill="#f0f0f0" />
        <path d="M7 2h2.5C10.88 2 12 3.12 12 4.5v5C12 10.88 10.88 12 9.5 12H7V7" fill="#f0f0f0" opacity="0.4" />
      </svg>
    </div>
  );
})

const IconMail = memo(() => {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2.5" width="11" height="8" rx="1.5" />
      <path d="M1 4.5l5.5 3.5 5.5-3.5" />
    </svg>
  );
})

const IconList = memo(() => {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" />
      <path d="M4 5h5M4 7.5h3" />
    </svg>
  );
})

export default function Popup() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loggedOut" });
  const [currentSite, setCurrentSite] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("otp");

  const inbox = useInbox(authState.status === "loggedIn" ? authState.dBUserId : "", currentSite);

  const onLogout = useCallback(() => {
    setAuthState({ status: "loggedOut" });
    chrome.storage.local.remove("sessionStatus");
    inbox.stopListener?.();
  }, [setAuthState, inbox]);

  async function handleLogin(loginUserId: string, password: string) {
    let authResult = await handleSignUpSignIn(loginUserId, password)
    setAuthState(authResult);
    if (!isValidSession(authResult)) {
      return;
    }

    setSessionStatus(authResult);
    if (authResult.status === "loggedIn") {
      detectSite((hostname) => {
        setCurrentSite(hostname);
      });
    }
  }

  useEffect(() => {
    validateLocalStorageInfo(
      (sessionStatus) => {
        detectSite((hostname) => {
          setCurrentSite(hostname);
          setAuthState({ status: "loggedIn", dBUserId: sessionStatus.dBUserId, loginUserId: sessionStatus.loginUserId });
        });
      },
      () => {
        chrome.storage.local.remove("sessionStatus");
      }
    )
  }, []);

  useEffect(() => {
    if (authState?.status === "loggedIn" && currentSite) {
      inbox.fetchSavedInboxes();
    }
  }, [authState, currentSite]);

  if (authState === null || authState.status === "error" || authState.status === "loggedOut") {
    return <LoginScreen onLogin={handleLogin} authState={authState} />;
  }

  return (
    <div className="flex flex-col bg-white rounded-xl border border-black/10 m-2 overflow-hidden">
      <Header userId={authState.status === "loggedIn" ? authState.loginUserId : ""} onLogout={onLogout} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex-1">
        {activeTab === "otp" ? (
          <OTPListener
            currentSite={currentSite}
            activeInbox={inbox.activeInbox}
            otpState={inbox.otpState}
            otp={inbox.otp}
            rawMessage={inbox.rawMessage}
            otpTimestamp={inbox.timestamp}
            loading={inbox.loading}
            error={inbox.error}
            onGenerate={inbox.generateNewInbox}
            onRefresh={inbox.refresh}
            userId={authState.status === "loggedIn" ? authState.dBUserId : ""}
            onSelect={inbox.selectInbox}
          />
        ) : (
          <SavedCreds
            currentSite={currentSite}
            savedInboxes={inbox.savedInboxes}
            activeInbox={inbox.activeInbox}
            onSelect={inbox.selectInbox}
            userId={authState.status === "loggedIn" ? authState.dBUserId : ""}
            onDelete={inbox.deleteInbox}
          />
        )}
      </div>
    </div>
  );
}