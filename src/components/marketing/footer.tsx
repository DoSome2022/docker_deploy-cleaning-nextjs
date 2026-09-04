import Link from "next/link";

/**
 * 公開網站頁尾（server component）
 */
export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">
            寶保清潔工程有限公司
          </h3>
          <p className="text-sm">BAOBAO CLEANING ENGINEERING CO., LTD</p>
          <p className="mt-2 text-sm">
            地址：香港新界荃灣德士古道 62-70 號寶業大廈 A 座 11 樓 A6 室
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">服務項目</h4>
          <ul className="space-y-2 text-sm">
            <li>辦公室清潔</li>
            <li>家居清潔</li>
            <li>診所清潔消毒</li>
            <li>商鋪／學校清潔</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">聯絡我們</h4>
          <ul className="space-y-2 text-sm">
            <li>Email：popocec2024@gmail.com</li>
            <li>WhatsApp：6588 6370</li>
            <li>24 小時營業</li>
            <li>
              <Link href="/login" className="text-gray-500 hover:text-gray-300">
                員工登入
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} 寶保清潔工程有限公司 版權所有
      </div>
    </footer>
  );
}
