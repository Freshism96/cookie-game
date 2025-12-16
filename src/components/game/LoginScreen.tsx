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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-5">
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
          autoFocus
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
