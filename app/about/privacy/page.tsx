// src/app/about/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | lumen-log',
  description: 'lumen-logのプライバシーポリシーについて説明します。',
  alternates: {
    canonical: 'https://lumen-log.com/about/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">個人情報の取り扱いについて</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            lumen-log（以下「当サイト」）は、ユーザーの個人情報保護を重要と考え、適切な管理に努めます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">アクセス解析ツールについて</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            当サイトでは、Googleアナリティクス等のアクセス解析ツールを使用する場合があります。
            これらのツールはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。
            Cookieの使用はブラウザの設定から無効にすることが可能です。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">広告について</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            当サイトでは、第三者配信の広告サービスを利用する場合があります。
            広告配信事業者はCookieを使用してユーザーの興味に応じた広告を表示することがあります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">アフィリエイトについて</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            当サイトは、各種アフィリエイトプログラムに参加しています。
            記事内のリンクからサービス申し込み・商品購入が発生した場合、当サイトに報酬が支払われることがあります。
            これはユーザーの費用負担を増加させるものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">免責事項</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            当サイトに掲載する情報は、できる限り正確な情報を提供するよう努めていますが、
            その内容の正確性・完全性を保証するものではありません。
            当サイトの情報を参考に行った投資・医療判断については、
            ユーザー自身の責任において行っていただきますようお願いします。
            当サイトに掲載する内容は、執筆者個人の見解であり、
            所属機関の意見を代表するものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">著作権</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            当サイトのコンテンツの著作権は運営者に帰属します。
            無断転載・複製はお断りします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">プライバシーポリシーの変更</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            本ポリシーは必要に応じて変更することがあります。
            変更後は当ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <p className="text-sm text-[var(--color-muted)] pt-4 border-t border-[var(--color-border)]">
          最終更新日：2026年6月25日
        </p>
      </div>
    </main>
  );
}
