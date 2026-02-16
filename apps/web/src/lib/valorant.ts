/**
 * ランクティアを日本語に変換
 */
export function formatRankTier(rankTier: string): string {
  const rankMap: Record<string, string> = {
    IRON: 'アイアン',
    BRONZE: 'ブロンズ',
    SILVER: 'シルバー',
    GOLD: 'ゴールド',
    PLATINUM: 'プラチナ',
    DIAMOND: 'ダイヤモンド',
    ASCENDANT: 'アセンダント',
    IMMORTAL: 'イモータル',
    RADIANT: 'レディアント',
  };

  return rankMap[rankTier.toUpperCase()] || rankTier;
}

/**
 * ゲームモードを日本語に変換
 */
export function formatGameMode(gameMode: string): string {
  const modeMap: Record<string, string> = {
    COMPETITIVE: 'コンペティティブ',
    UNRATED: 'アンレート',
    DEATHMATCH: 'デスマッチ',
    SPIKE_RUSH: 'スパイクラッシュ',
    ESCALATION: 'エスカレーション',
    TEAM_DEATHMATCH: 'チームデスマッチ',
    SWIFTPLAY: 'スイフトプレイ',
  };

  return modeMap[gameMode.toUpperCase()] || gameMode;
}

/**
 * 値が改善されたかどうかを判定（高い方が良い場合）
 */
export function isImprovement(
  currentValue: number,
  previousValue: number,
  higherIsBetter = true,
): 'improvement' | 'decline' | 'same' {
  if (currentValue === previousValue) {
    return 'same';
  }

  const isHigher = currentValue > previousValue;

  if (higherIsBetter) {
    return isHigher ? 'improvement' : 'decline';
  } else {
    return isHigher ? 'decline' : 'improvement';
  }
}
