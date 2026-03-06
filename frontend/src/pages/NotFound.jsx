import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-8xl font-extrabold text-[#075f47]">404</h1>
      <p className="mt-4 text-xl font-semibold text-gray-800">Page not found</p>
      <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block bg-[#075f47] text-white px-6 py-3 rounded-lg hover:bg-[#064e3b] transition-colors"
      >
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
