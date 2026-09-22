import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  Headset,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { COMPANY } from "../../_data/catalog";
import { Reveal } from "../../_components/reveal";

/** Englische Service-Seite – gleicher Aufbau wie /bit/service. */

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/service" },
  title: "Service",
  description:
    "Advice, logistics, processing and quality management: the BIT service – standard articles usually within 24 hours.",
};

const PILLARS = [
  {
    icon: Headset,
    image: "/bit/pages/service-35.jpg",
    title: "Advice",
    points: [
      "Technically qualified advice for your individual requirements",
      "Problem solving on site",
      "Dedicated contact persons",
    ],
    text: "Professional advice for our customers is not just an obligation for us but an essential part of our daily thinking and acting. With our competent and committed team we support you in finding the optimal product solutions for your application.",
  },
  {
    icon: Truck,
    image: "/bit/pages/service-36.jpg",
    title: "Logistics",
    points: ["High storage capacity", "Immediate and scheduled orders", "Just-in-time production"],
    text: "Speed and reliability count! BIT maintains comprehensive stock-keeping and offers customer-oriented logistics: as a rule you receive our standard articles within 24 hours.",
  },
  {
    icon: Wrench,
    image: "/bit/pages/service-37.jpg",
    title: "Processing & service",
    points: [
      "Printing, cutting to length, perforating",
      "Individual packaging units, own packaging and labels",
      "Direct shipment to your customers",
    ],
    text: "We process our heat-shrink and insulating tubing on six production lines. We are happy to cut to your specification; braided sleeves are thermally cut to length on request.",
  },
  {
    icon: ShieldCheck,
    image: "/bit/pages/service-38.jpg",
    title: "Quality management",
    points: [
      "Continuous checks at goods receipt, in production and at goods issue",
      "Measurement reports and works test certificates",
      "Shrink oven and measuring equipment for wall thickness, diameter and length",
    ],
    text: "Committed to the quality of our products and services, we regularly undergo certification according to DIN EN ISO 9001. TÜV first confirmed our quality management in 1997 – most recently in July 2025 without any objections.",
  },
  {
    icon: BadgeCheck,
    image: "/bit/pages/service-39.jpg",
    title: "Certification",
    points: [
      "DIN EN ISO 9001:2015",
      "UL File E196690 and UL File E362210",
      "All products REACH and RoHS compliant",
    ],
    text: "For our customers this means maximum transparency, safety, efficiency and service – documented and traceable.",
  },
];

export default function ServicePage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">About BIT</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Service</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
            “Whoever stops getting better has stopped being good.” Highest quality, shortest
            response times, greatest reliability and comprehensive service have distinguished{" "}
            {COMPANY.legalName} for almost 30 years.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Your advantages at a glance
        </h2>
        <div className="mt-10 space-y-10">
          {PILLARS.map(({ icon: Icon, image, title, points, text }, i) => (
            <Reveal key={title} delay={0}>
              <article
                className={`grid items-center gap-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden rounded-2xl bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={title}
                    className="aspect-[16/10] w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
              <Download className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Downloads</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Data sheets for all products, our delivery programme, certificates and supplier
              declarations can be found in the download area.
            </p>
            <Link
              href="/bit/en/service/downloads"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              Go to downloads <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
              <Headset className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Processing to your specification?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Talk to our sales team – whether cutting, printing, special packaging units or direct
              shipment to your customers.
            </p>
            <Link
              href="/bit/en/contact"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              Get in touch <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
