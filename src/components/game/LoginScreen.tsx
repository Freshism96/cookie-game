import React, { useState, useEffect } from 'react';
import { fetchStudentData } from '@/services/api';
import { UserData } from '@/types/game';

interface LoginScreenProps {
  onLogin: (userData: UserData) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [studentCode, setStudentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('custom_api_key') || '');
  const [showSetup, setShowSetup] = useState(!localStorage.getItem('custom_api_key'));
  const [showQR, setShowQR] = useState(false);
  const [qrError, setQrError] = useState(false);
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // Helper functions for safe Base64 encoding/decoding of Unicode strings
  const safeBtoa = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error("Encoding error", e);
      return "";
    }
  };

  const safeAtob = (str: string) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      console.error("Decoding error", e);
      return "";
    }
  };

  // 1. Magic Link Logic: Check for 'k' parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicKey = params.get('k');

    if (magicKey) {
      try {
        const decodedKey = safeAtob(magicKey);
        if (decodedKey) {
          localStorage.setItem('custom_api_key', decodedKey);
          setApiKey(decodedKey);
          setShowSetup(false);

          // Clean URL without reloading
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: newUrl }, '', newUrl);

          console.log('Magic Link: API Key configured successfully.');
        }
      } catch (e) {
        console.error('Invalid Magic Key encoding', e);
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!studentCode.trim()) return;

    setIsLoading(true);
    const data = await fetchStudentData(studentCode.trim());
    setIsLoading(false);

    if (data) {
      onLogin({
        studentName: data.name,
        cookies: data.totalCookie,
        purchases: { hpBoost: 0, dmgBoost: 0, critBoost: 0, speedBoost: 0, expBoost: 0 }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const saveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      localStorage.setItem('custom_api_key', trimmedKey);
      setApiKey(trimmedKey);
    } else {
      localStorage.removeItem('custom_api_key');
      setApiKey('');
    }
  };

  const getMagicLink = () => {
    const origin = window.location.origin + window.location.pathname;
    const encodedKey = safeBtoa(apiKey);
    return `${origin}?k=${encodedKey}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-5">

      {/* Teacher Setup / QR Modal */}
      {(showSetup || showQR) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-background border-2 border-primary p-8 max-w-md w-full shadow-[0_0_50px_rgba(var(--primary),0.3)] relative">
            <button
              onClick={() => { setShowSetup(false); setShowQR(false); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary font-bold text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-primary mb-6 font-korean text-center">
              {showQR ? '학생 초대 (QR 코드)' : '선생님 설정 (API Key)'}
            </h3>

            {showQR ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                {isLocalhost && (
                  <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded mb-4 text-xs font-bold text-center w-full">
                    ⚠️ 주의: 로컬 환경(Localhost)에서는 외부 접속이 불가능할 수 있습니다.
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl mb-6 shadow-lg min-h-[220px] flex items-center justify-center">
                  {!qrError ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(getMagicLink())}`}
                      alt="Magic Link QR"
                      className="w-48 h-48"
                      onError={() => setQrError(true)}
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center border-2 border-dashed border-gray-300 rounded">
                      QR 생성 실패<br />(링크를 복사하세요)
                    </div>
                  )}
                </div>
                <p className="text-center text-muted-foreground mb-4 font-korean break-all text-sm px-4">
                  API Key가 포함된 매직 링크 QR입니다.
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      window.navigator.clipboard.writeText(getMagicLink());
                      alert('초대 링크가 복사되었습니다!');
                    }}
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded font-korean font-bold transition-colors"
                  >
                    링크 복사
                  </button>
                  <button
                    onClick={() => { setShowQR(false); setShowSetup(false); }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded font-korean font-bold transition-colors"
                  >
                    완료 (학생 화면으로)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary font-korean">다했니 API Key 입력</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API Key를 입력하세요"
                    className="w-full border-2 border-primary/50 bg-secondary/50 p-4 text-center font-terminal focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-muted-foreground font-korean text-center">
                    * API Key는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={() => {
                      saveApiKey(apiKey);
                      setShowQR(true);
                    }}
                    disabled={!apiKey.trim()}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-korean"
                  >
                    API Key 저장 및 QR코드 생성
                  </button>
                  <button
                    onClick={() => {
                      saveApiKey(apiKey);
                      setShowSetup(false);
                    }}
                    className="w-full py-3 bg-transparent border border-primary text-primary hover:bg-primary/10 font-korean font-bold"
                  >
                    저장하고 게임 시작하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Student Login View */}
      <h1 className="mb-4 text-4xl lg:text-6xl font-bold text-primary text-glow font-korean animate-pulse-slow">
        다했니 시스템 디펜더
      </h1>

      <div className="mb-8 max-w-md text-center text-xl text-muted-foreground font-korean">
        <p>&gt; 고정형 방어 시스템 가동...</p>
        <p>&gt; 외부 침입을 저지하십시오.</p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-full space-y-2">
          <label className="text-2xl text-primary font-korean block text-center">학생 코드 입력</label>
          <input
            type="text"
            value={studentCode}
            onChange={(e) => {
              // Allow lowercase, block Korean (Hangul)
              const val = e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
              setStudentCode(val);
            }}
            onKeyDown={handleKeyDown}
            placeholder="CODE"
            disabled={isLoading || showSetup}
            autoFocus={!showSetup}
            autoComplete="off"
            className="w-full border-2 border-primary bg-background/80 p-4 text-center font-terminal text-3xl text-primary placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/20 box-glow transition-all"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading || !studentCode}
          className="w-full py-4 bg-primary text-primary-foreground text-xl font-bold rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-korean shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? '시스템 접속 중...' : '작전 시작'}
        </button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground font-korean animate-bounce">
        {isLoading ? '데이터 동기화 중...' : '엔터(Enter)를 눌러 접속하세요'}
      </p>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-xs text-muted-foreground/40 font-korean text-center">
        <p>SYSTEM VER. 2.0 // SECURE CONNECTION</p>
        <p>테스터 코드: TESTER, TEST, DEMO</p>
      </div>

      {/* Teacher Settings Trigger */}
      <button
        onClick={() => setShowSetup(true)}
        className="absolute top-4 right-4 p-3 text-primary/40 hover:text-primary transition-colors duration-300"
        title="선생님 설정"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
  );
};
