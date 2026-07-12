import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustMarquee, Services, Process, Pricing, Maintenance, Regions } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict.nav} />
      <main>
        <Hero dict={dict.hero} locale={locale} />
        <TrustMarquee dict={dict.trust} />
        <Services dict={dict.services} />
        <Process dict={dict.process} />
        <Pricing dict={dict.pricing} contact={dict.contact} locale={locale} />
        <Maintenance dict={dict.maintenance} locale={locale} />
        <Regions dict={dict.regions} />
        <Faq dict={dict.faq} />
        <ContactForm
          locale={locale}
          dict={dict.contact}
          offerDict={dict.offer}
          maintenanceNames={{
            basic: dict.maintenance.plans[0].name,
            business: dict.maintenance.plans[1].name,
            premium: dict.maintenance.plans[2].name,
          }}
          maintenancePerMonth={dict.maintenance.perMonth}
        />
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
