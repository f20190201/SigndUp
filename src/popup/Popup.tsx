import { useState, useEffect, memo, useCallback, lazy } from "react";
import Header from "../components/Header";
import { useInbox } from "../hooks/useInbox";
import { detectSite, validateLocalStorageInfo, handleSignUpSignIn, type AuthState, isValidSession, setSessionStatus } from "../utils/generic-utils";
import LoginScreen from "../components/library/LoginScreen";
import IconMail from "../components/library/IconMail";
import IconList from "../components/library/IconList";
import { signOut } from "../utils/supabase-utils";
import { useToast, type ToastType } from "../hooks/useToast";
const OTPListener = lazy(() => import("../components/OTPListener"));
const SavedCreds = lazy(() => import("../components/SavedCreds"));

type Tab = "otp" | "creds";

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

export default function Popup() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loggedOut" });
  const [currentSite, setCurrentSite] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("otp");
  const { showToast, Toast } = useToast();

  const inbox = useInbox(authState.status === "loggedIn" ? authState.dBUserId : "", currentSite);

  const onLogout = useCallback(() => {
    signOut().then(({ error }) => {
      if (!!error) {
        console.log(error);
        showToast("Failed to logout", "error");
      } else {
        setAuthState({ status: "loggedOut" });
        chrome.storage.local.remove("sessionStatus");
        inbox.stopListener?.()
        showToast("Logged out successfully", "success");
      }
    }).catch((err) => {
      console.log(err);
    })

  }, [setAuthState, inbox]);

  async function handleLogin(loginUserId: string, password: string, setIsLoginLoading: (value: boolean) => void) {
    setIsLoginLoading(true);
    let authResult = await handleSignUpSignIn(loginUserId, password)
    setAuthState(authResult);
    if (!isValidSession(authResult)) {
      setIsLoginLoading(false);
      return;
    }

    setSessionStatus(authResult);
    if (authResult.status === "loggedIn") {
      detectSite((hostname) => {
        setCurrentSite(hostname);
      });
    }
    setIsLoginLoading(false);
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

  return (
    <>
      <Toast />
      {authState.status === "loggedOut" || authState.status === "error" ? (
        <LoginScreen onLogin={handleLogin} authState={authState} />
      ) : (
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
                loading={inbox.loading}
                showToast={showToast}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}