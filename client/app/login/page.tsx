import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">University Super App</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}