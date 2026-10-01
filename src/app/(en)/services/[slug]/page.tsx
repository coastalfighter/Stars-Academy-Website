import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/content/services";
import { servicesCopy } from "@/content/copy/services";
import { serviceSlugFromLocal } from "@/i18n/routes";
import { serviceMetadata } from "@/i18n/metadata";
import { ServiceDetailView } from "@/views/ServiceDetailView";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = serviceSlugFromLocal("en", (await params).slug);
  const service = services.find((s) => s.slug === id);
  if (!id || !service) return {};
  return serviceMetadata("en", id, {
    title: `${service.name} ${servicesCopy.en.detail.metaSuffix}`,
    description: `${service.intro.slice(0, 150)}…`,
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const id = serviceSlugFromLocal("en", (await params).slug);
  if (!id) notFound();
  return <ServiceDetailView locale="en" slug={id} />;
}
