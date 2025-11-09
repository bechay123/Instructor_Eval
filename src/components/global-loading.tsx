import { useLoading } from "../context/LoadingContext";

export function GlobalLoading() {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto"></div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            {loadingState.message}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {loadingState.submessage}
          </p>
        </div>
      </div>
    </div>
  );
}
