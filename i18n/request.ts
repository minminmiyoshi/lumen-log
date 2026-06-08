import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // 今はja固定。後でユーザー設定やURLから切り替え可能にする
  const locale = "ja";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});