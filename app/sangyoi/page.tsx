import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "産業医サービス（2026 autumn 開始予定） | Lumen-log",
  description:
    "夜勤・交代勤務のある職場の産業保健を支援する産業医サービス。夜勤医師自身の実測データと臨床経験に基づく、交代勤務者のための健康支援。2026年秋 開始予定。",
  alternates: { canonical: "/sangyoi" },
};

export default function SangyoiPage() {
  return (
    <main className="min-h-screen bg-washi text-sumi">
      <div className="max-w-[720px] mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* status */}
        <div className="flex items-center gap-4 mb-10">
          <span className="inline-block w-16 h-[1.5px] bg-bengara" />
          <span className="font-mono text-[11px] text-bengara tracking-wide">
            coming — 2026 autumn
          </span>
        </div>

        <h1 className="font-serif text-[34px] md:text-[46px] leading-[1.15] font-normal m-0">
          産業医サービス
        </h1>
        <p className="font-mincho text-[15px] md:text-base text-mist mt-3">
          交代勤務者の健康を、当事者として分かる産業医。
        </p>

        <div className="mt-10 flex items-center gap-4">
          <span className="inline-block w-10 h-[1px] bg-hairline" />
          <span className="font-mono text-[11px] text-mist">about</span>
        </div>

        <div className="mt-6 space-y-5 font-mincho text-[15px] leading-[1.95] text-sumi-soft">
          <p>
            夜勤・交代勤務は、生活習慣病・睡眠障害・メンタル不調のリスクを高めることが
            分かっています。にもかかわらず、シフト勤務の実態を踏まえた産業保健は
            まだ十分に届いていません。
          </p>
          <p>
            このサービスは、夜勤のある救急医自身が、自分の身体データ（睡眠・自律神経・
            回復）を継続的に計測しながら積み上げてきた
            <Link href="/health" className="text-bengara hover:underline"> 夜勤の科学</Link>
            と、
            <Link href="/health/dashboard" className="text-bengara hover:underline">n=1 の実証記録</Link>
            を土台にしています。「夜勤を知らない産業医」ではなく、
            当事者として交代勤務の現場を支援することを目指します。
          </p>
          <p className="text-mist text-[14px]">
            2026年秋、産業医資格の取得と法人化に合わせて開始予定です。
            準備が整い次第、このページでサービス内容とお問い合わせ先をご案内します。
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between">
          <Link
            href="/health"
            className="font-mono text-[11px] text-sumi hover:text-bengara transition-colors"
          >
            ← 夜勤の科学を読む
          </Link>
          <span className="font-mono text-[11px] text-mist">Lumen-log ©</span>
        </div>
      </div>
    </main>
  );
}
