import React, { ReactNode } from "react";
import NavBar from "../components/NavBar";

type Props = {
  children: ReactNode;
};

export default function Layout(props: Props) {
  return (
    <div className="h-full">
      <NavBar />
      {props.children}
    </div>
  );
}
