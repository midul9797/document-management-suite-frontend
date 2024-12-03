import { SignUp } from "@clerk/nextjs";
import React from "react";

const Signup = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <SignUp />
    </div>
  );
};
export default Signup;
