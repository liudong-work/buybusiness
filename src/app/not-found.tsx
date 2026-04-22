import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">页面未找到</h1>
        <p className="text-xl text-gray-600 mb-8">抱歉，您访问的页面不存在</p>
        <Link
          href="/"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
