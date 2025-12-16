import React from 'react';
import { UserData, GameMode } from '@/types/game';
import { SHOP_ITEMS } from '@/constants/game';
import { Button } from '@/components/ui/button';

interface ShopScreenProps {
  userData: UserData;
  onBuyItem: (itemId: 'hpBoost' | 'dmgBoost' | 'critBoost' | 'speedBoost' | 'expBoost', cost: number, limit: number) => void;
  onResetPurchases: () => void;
  onStartGame: (mode: GameMode) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  userData,
  onBuyItem,
  onResetPurchases,
  onStartGame
}) => {
  const totalSpent = SHOP_ITEMS.reduce((acc, item) => {
    return acc + (item.cost * userData.purchases[item.id]);
  }, 0);

  const hasPurchases = userData.purchases.hpBoost > 0 ||
    userData.purchases.dmgBoost > 0 ||
    userData.purchases.critBoost > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-5">
      <h2 className="mb-2 text-3xl font-bold text-accent font-korean">시스템 상점</h2>

      <p className="mb-2 text-xl text-primary font-korean">
        환영합니다, <span className="font-bold text-accent">{userData.studentName}</span>님!
      </p>

      <p className="mb-4 text-lg text-muted-foreground font-korean">
        보유 쿠키: <span className="font-terminal text-foreground">{userData.cookies}</span>
      </p>

      <div className="mb-4 flex w-full max-w-md flex-col items-center gap-2 overflow-y-auto max-h-[45vh]">
        {SHOP_ITEMS.map((item) => {
          const currentLevel = userData.purchases[item.id];
          const canBuy = userData.cookies >= item.cost && currentLevel < item.limit;

          return (
            <div
              key={item.id}
              className="flex w-full items-center justify-between border border-primary bg-secondary/50 p-3 transition-colors hover:bg-secondary"
            >
              <div>
                <div className="font-bold text-primary font-korean">
                  {item.name}{' '}
                  <span className="text-sm text-muted-foreground">
                    (Lv.{currentLevel}/{item.limit})
                  </span>
                </div>
                <div className="text-sm text-muted-foreground font-korean">{item.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-terminal text-sm text-accent">{item.cost} C</span>
                <Button
                  onClick={() => onBuyItem(item.id, item.cost, item.limit)}
                  disabled={!canBuy}
                  size="sm"
                  className="font-terminal"
                >
                  구매
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {hasPurchases && (
        <Button
          onClick={onResetPurchases}
          variant="outline"
          size="sm"
          className="mb-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-korean"
        >
          구매 초기화 (환불: {totalSpent} 쿠키)
        </Button>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => onStartGame('hangul')}
          variant="outline"
          size="lg"
          className="min-w-[180px] border-2 border-primary bg-background font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:box-glow font-korean"
        >
          한글 타자 방어
        </Button>
        <Button
          onClick={() => onStartGame('math')}
          variant="outline"
          size="lg"
          className="min-w-[180px] border-2 border-primary bg-background font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:box-glow font-korean"
        >
          구구단 방어
        </Button>
        <Button
          onClick={() => onStartGame('arithmetic')}
          variant="outline"
          size="lg"
          className="min-w-[180px] border-2 border-primary bg-background font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:box-glow font-korean"
        >
          덧셈/뺄셈 방어
        </Button>
      </div>
    </div>
  );
};
