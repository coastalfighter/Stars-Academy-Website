import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/content/es/services";
import { servicesCopy } from "@/content/copy/services";
import { SERVICE_SLUGS, serviceSlugFromLocal } from "@/i18n/routes";
import { serviceMetadata } from "@/i18n/metadata";
import { ServiceDetailView } from "@/views/ServiceDetailView";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: SERVICE_SLUGS[s.slug].es }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = serviceSlugFromLocal("es", (await params).slug);
  const service = services.find((s) => s.slug === id);
  if (!id || !service) return {};
  return serviceMetadata("es", id, {
    title: `${service.name} ${servicesCopy.es.detail.metaSuffix}`,
    description: `${service.intro.slice(0, 150)}…`,
  });
}

export default async function ServicioPage({ params }: { params: Params }) {
  const id = serviceSlugFromLocal("es", (await params).slug);
  if (!id) notFound();
  return <ServiceDetailView locale="es" slug={id} />;
}
