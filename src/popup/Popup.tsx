import { useState, useEffect, memo, useCallback, lazy } from "react";
import Header from "../components/Header";
import { useInbox } from "../hooks/useInbox";
import { detectSite, validateLocalStorageInfo, handleSignUpSignIn, type AuthState, isValidSession, setSessionStatus, clearDataOnLogout } from "../utils/generic-utils";
import LoginScreen from "../components/library/LoginScreen";
import TabBar, { type Tab } from "../components/library/TabBar";
import { signOut } from "../utils/supabase-utils";
import { useToast } from "../hooks/useToast";
const OTPListener = lazy(() => import("../components/OTPListener"));
const SavedCreds = lazy(() => import("../components/SavedCreds"));

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
        clearDataOnLogout(setAuthState, inbox.stopListener, showToast);
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
    chrome.alarms.clear("sessionTimeout").then((_) => {
      chrome.alarms.create("sessionTimeout", { delayInMinutes: 7 });
    });
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
        <div className="flex flex-col bg-white rounded-2xl border border-black/5 m-2.5 overflow-hidden shadow-xl animate-in glass ring-1 ring-black/[0.02]">
          <Header userId={authState.status === "loggedIn" ? authState.loginUserId : ""} onLogout={onLogout} />
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex-1 transition-all duration-300 ease-out">
            {activeTab === "otp" ? (
              <div className="animate-in" key="otp-tab">
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
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="animate-in" key="creds-tab">
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}