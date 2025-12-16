import React, { useState } from 'react';
import { fetchStudentData } from '@/services/api';
import { UserData } from '@/types/game';

interface LoginScreenProps {
  onLogin: (userData: UserData) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [studentCode, setStudentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_api_key') || '');

  const saveApiKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('custom_api_key', customKey.trim());
      alert('API Key가 저장되었습니다.');
    } else {
      localStorage.removeItem('custom_api_key');
      alert('기본 API Key를 사용합니다.');
    }
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-5">
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary transition-colors"
      >
        ⚙️ 설정
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="bg-background border border-primary p-6 max-w-sm w-full shadow-lg shadow-primary/20">
            <h3 className="text-xl font-bold text-primary mb-4 font-korean">API 설정</h3>
            <p className="text-sm text-muted-foreground mb-2 font-korean">새로운 API Key를 입력하세요:</p>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="기본 키 사용 (비워두기)"
              className="w-full border border-primary/50 bg-secondary p-2 mb-4 text-sm font-terminal"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-korean"
              >
                취소
              </button>
              <button
                onClick={saveApiKey}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold hover:bg-primary/90 font-korean"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-4 text-4xl font-bold text-primary text-glow font-korean">
        다했니 시스템 디펜더
      </h1>

      <div className="mb-8 max-w-md text-center text-xl text-muted-foreground font-korean">
        <p>&gt; 고정형 방어 시스템 가동...</p>
        <p>&gt; 외부 침입을 저지하십시오.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <label className="text-2xl text-primary font-korean">학생 코드 입력:</label>
        <input
          type="text"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="CODE"
          disabled={isLoading}
          autoFocus={!showSettings}
          autoComplete="off"
          className="w-48 border border-primary bg-background p-2 text-center font-terminal text-2xl uppercase text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary box-glow"
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground font-korean">
        {isLoading ? '접속 중...' : '엔터(Enter)를 눌러 접속하세요'}
      </p>

      <div className="mt-8 text-xs text-muted-foreground/60 font-korean">
        <p>테스터 코드: TESTER, TEST, DEMO</p>
      </div>
    </div>
  );

};
