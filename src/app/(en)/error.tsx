"use client";

import { ErrorView, type ErrorViewProps } from "@/views/ErrorView";

export default function Error({ error, retry }: Omit<ErrorViewProps, "locale">) {
  return <ErrorView locale="en" error={error} retry={retry} />;
}
