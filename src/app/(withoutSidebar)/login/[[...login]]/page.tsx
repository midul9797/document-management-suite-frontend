import { SignIn } from "@clerk/nextjs";
import React from "react";

const Login = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <SignIn />
    </div>
  );
};
export default Login;
