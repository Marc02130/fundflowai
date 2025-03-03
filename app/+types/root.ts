import type React from "react";
// Define ReactNode locally as a workaround
type ReactNode = React.ReactNode;

export namespace Route {
  export interface ErrorBoundaryProps {
    error: unknown;
    children?: ReactNode;
  }
  
  export interface MetaArgs {
    [key: string]: any;
  }
  
  export interface LinksFunction {
    (): Array<{ rel: string; href: string; [key: string]: any }>;
  }
} 