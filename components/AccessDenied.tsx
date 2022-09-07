import { signIn } from "next-auth/react";

export default function AccessDenied() {
  return (
    <div className="grid content-center h-full text-center">
      <div className="m-5 font-bold">Access Denied</div>
      <div className="">
        <button
          className="text-blue-600 rounded-full hover:text-black"
          onClick={() => signIn()}
        >
          Sign In
        </button>
        , to access the application.
      </div>
    </div>
  );
}
