// 読了時間を計算して表示するコンポーネント
// 日本語は1文字=0.5単語として計算（日本語読書速度：約400〜600文字/分）
// HTMLタグを除去してからカウントする

interface ReadingTimeProps {
  content: string; // HTML or plain text
}

export function calcReadingTime(content: string): number {
  // HTMLタグを除去
  const text = content.replace(/<[^>]+>/g, '');
  // 日本語文字数カウント（ひらがな・カタカナ・漢字）
  const japaneseChars = (text.match(/[\u3000-\u9FFF\uFF00-\uFFEF]/g) || []).length;
  // 英数字は単語単位でカウント（平均5文字/単語）
  const asciiWords = text.replace(/[\u3000-\u9FFF\uFF00-\uFFEF]/g, '').trim().split(/\s+/).filter(Boolean).length;
  // 日本語500文字/分、英語200単語/分で換算
  const minutes = japaneseChars / 500 + asciiWords / 200;
  return Math.max(1, Math.round(minutes));
}

export default function ReadingTime({ content }: ReadingTimeProps) {
  const minutes = calcReadingTime(content);
  return (
    <span className="text-sm text-[var(--color-muted)] flex items-center gap-1">
      <ClockIcon />
      約{minutes}分で読めます
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
