import { getLocale } from "next-intl/server";
import Link from "next/link";

// ─── BUSINESS INFO ───────────────────────────────────────────────────────────
// Replace these placeholders with your actual company details.
const BUSINESS = {
  companyName: "[REPLACE: Ragione sociale, es. Scarpe Italiane Stock S.r.l.]",
  vatNumber: "[REPLACE: Partita IVA, es. IT01234567890]",
  fiscalCode: "[REPLACE: Codice Fiscale]",
  reaNumber: "[REPLACE: Numero REA]",
  registeredOffice: "[REPLACE: Sede legale, via, città, CAP, Italia]",
  email: "[REPLACE: email@scarpeitalianestock.it]",
  phone: "[REPLACE: +39 ...]",
  pec: "[REPLACE: pec@scarpeitalianestock.it]",
  courtJurisdiction: "[REPLACE: Foro competente, es. Tribunale di Milano]",
};

export default async function TermsPage() {
  const locale = await getLocale();
  const isIt = locale === "it";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/${locale}`}
        className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        ← {isIt ? "Torna alla home" : "Back to home"}
      </Link>
      <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mt-4 mb-2">
        {isIt ? "Termini e Condizioni di Vendita" : "Terms and Conditions of Sale"}
      </h1>
      <p className="text-sm text-stone-400 mb-10">
        {isIt
          ? `Ultimo aggiornamento: ${new Date().toLocaleDateString("it-IT")}`
          : `Last updated: ${new Date().toLocaleDateString("en-GB")}`}
      </p>

      <article className="prose-stone text-stone-700 dark:text-stone-300 leading-relaxed flex flex-col gap-6 text-sm">
        {isIt ? <ItalianTerms /> : <EnglishTerms />}
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2">{title}</h2>
      {children}
    </section>
  );
}

function ItalianTerms() {
  return (
    <>
      <Section title="1. Informazioni sul venditore">
        <p>I presenti Termini e Condizioni disciplinano la vendita di prodotti tramite il sito <strong>scarpeitalianestock.it</strong> (di seguito &quot;Sito&quot;).</p>
        <p>Il venditore è:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>{BUSINESS.companyName}</li>
          <li>Sede legale: {BUSINESS.registeredOffice}</li>
          <li>P.IVA: {BUSINESS.vatNumber}</li>
          <li>Codice Fiscale: {BUSINESS.fiscalCode}</li>
          <li>REA: {BUSINESS.reaNumber}</li>
          <li>Email: {BUSINESS.email}</li>
          <li>PEC: {BUSINESS.pec}</li>
          <li>Telefono: {BUSINESS.phone}</li>
        </ul>
      </Section>

      <Section title="2. Oggetto del contratto">
        <p>Il presente contratto ha per oggetto la vendita di calzature italiane offerte sul Sito. Le caratteristiche dei prodotti sono indicate nelle relative schede prodotto.</p>
      </Section>

      <Section title="3. Prezzi">
        <p>Tutti i prezzi indicati sul Sito sono espressi in Euro (EUR) e si intendono al consumatore finale. Le spese di spedizione, se applicabili, sono indicate separatamente al momento del checkout.</p>
        <p>Il venditore si riserva il diritto di modificare i prezzi in qualsiasi momento; il prezzo applicabile è quello pubblicato al momento dell&apos;invio dell&apos;ordine.</p>
      </Section>

      <Section title="4. Conclusione del contratto">
        <p>Il contratto si conclude con l&apos;invio della conferma d&apos;ordine da parte del venditore all&apos;indirizzo email indicato dal cliente. Il venditore si riserva il diritto di rifiutare ordini in caso di indisponibilità del prodotto, errori manifesti nei prezzi o sospetto di frode.</p>
      </Section>

      <Section title="5. Pagamenti">
        <p>I pagamenti sono gestiti tramite Stripe e/o PayPal. Il venditore non conserva dati di pagamento (numeri di carta) sui propri server. Tutti i pagamenti sono protetti da crittografia SSL.</p>
      </Section>

      <Section title="6. Spedizione e consegna">
        <p>Le spedizioni avvengono esclusivamente in Italia tramite corrieri (BRT, GLS, Poste Italiane). I tempi di consegna standard sono di 2-7 giorni lavorativi dalla conferma del pagamento. Il rischio di perdita o danneggiamento dei beni passa al consumatore al momento della consegna.</p>
      </Section>

      <Section title="7. Diritto di recesso (consumatori)">
        <p>Ai sensi degli articoli 52 e seguenti del D.Lgs. 206/2005 (Codice del Consumo), il consumatore ha il diritto di recedere dal contratto entro <strong>14 giorni</strong> dalla consegna del prodotto, senza fornire alcuna motivazione.</p>
        <p>Per esercitare il diritto di recesso, è necessario inviare una comunicazione scritta all&apos;indirizzo {BUSINESS.email} entro il termine indicato. Il prodotto deve essere restituito integro, nella confezione originale, completo di etichette.</p>
        <p>Le spese di restituzione sono a carico del consumatore, salvo diverso accordo. Il rimborso sarà effettuato entro 14 giorni dalla ricezione del prodotto restituito, utilizzando lo stesso mezzo di pagamento.</p>
        <p>Il diritto di recesso non si applica a prodotti personalizzati o realizzati su misura.</p>
      </Section>

      <Section title="8. Garanzia legale di conformità">
        <p>I prodotti sono coperti dalla garanzia legale di conformità di <strong>24 mesi</strong> dalla consegna, ai sensi del Codice del Consumo. Per attivare la garanzia, contattare {BUSINESS.email} indicando l&apos;ID ordine e la descrizione del difetto.</p>
      </Section>

      <Section title="9. Disponibilità dei prodotti">
        <p>I prodotti venduti sono in quantità limitate, in quanto provenienti da stock. La disponibilità è indicata sul Sito ma non costituisce garanzia di evasione: in caso di indisponibilità sopravvenuta, il cliente sarà tempestivamente informato e l&apos;eventuale importo già pagato sarà integralmente rimborsato.</p>
      </Section>

      <Section title="10. Limitazione di responsabilità">
        <p>Il venditore non risponde di danni indiretti, perdita di profitto o danni conseguenti derivanti dall&apos;uso dei prodotti, salvo i casi previsti dalla legge.</p>
      </Section>

      <Section title="11. Modifiche ai Termini">
        <p>Il venditore si riserva il diritto di modificare i presenti Termini in qualsiasi momento. La versione applicabile è quella pubblicata al momento dell&apos;ordine.</p>
      </Section>

      <Section title="12. Legge applicabile e foro competente">
        <p>Il presente contratto è disciplinato dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il {BUSINESS.courtJurisdiction}, salvo il foro inderogabile del consumatore.</p>
        <p>Il consumatore può inoltre ricorrere alla piattaforma europea di risoluzione delle controversie online (ODR): <a href="https://ec.europa.eu/consumers/odr" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>
      </Section>

      <Section title="13. Contatti">
        <p>Per qualsiasi domanda relativa ai presenti Termini, scrivere a: {BUSINESS.email}</p>
      </Section>
    </>
  );
}

function EnglishTerms() {
  return (
    <>
      <Section title="1. Seller information">
        <p>These Terms and Conditions govern the sale of products through the website <strong>scarpeitalianestock.it</strong> (the &quot;Site&quot;).</p>
        <p>The seller is:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>{BUSINESS.companyName}</li>
          <li>Registered office: {BUSINESS.registeredOffice}</li>
          <li>VAT no.: {BUSINESS.vatNumber}</li>
          <li>Fiscal code: {BUSINESS.fiscalCode}</li>
          <li>REA: {BUSINESS.reaNumber}</li>
          <li>Email: {BUSINESS.email}</li>
          <li>Certified email (PEC): {BUSINESS.pec}</li>
          <li>Phone: {BUSINESS.phone}</li>
        </ul>
      </Section>

      <Section title="2. Subject of the contract">
        <p>This contract concerns the sale of Italian footwear offered on the Site. Product specifications are listed on each product page.</p>
      </Section>

      <Section title="3. Prices">
        <p>All prices on the Site are in Euros (EUR) for end consumers. Shipping costs, if any, are shown separately at checkout.</p>
        <p>The seller may change prices at any time; the applicable price is the one published when the order is submitted.</p>
      </Section>

      <Section title="4. Contract conclusion">
        <p>The contract is concluded when the seller sends an order confirmation to the email address provided by the customer. The seller reserves the right to refuse orders if products are unavailable, in case of manifest price errors, or suspected fraud.</p>
      </Section>

      <Section title="5. Payments">
        <p>Payments are processed via Stripe and/or PayPal. The seller does not store payment data (card numbers) on its own servers. All payments are protected by SSL encryption.</p>
      </Section>

      <Section title="6. Shipping and delivery">
        <p>Shipping is only available within Italy via couriers (BRT, GLS, Poste Italiane). Standard delivery time is 2–7 working days from payment confirmation. Risk of loss or damage passes to the consumer upon delivery.</p>
      </Section>

      <Section title="7. Right of withdrawal (consumers)">
        <p>Under Articles 52 ff. of Italian Legislative Decree 206/2005 (Consumer Code), consumers have the right to withdraw from the contract within <strong>14 days</strong> of delivery, without giving any reason.</p>
        <p>To exercise this right, send a written notice to {BUSINESS.email} within the deadline. The product must be returned intact, in its original packaging, with all tags attached.</p>
        <p>Return shipping costs are borne by the consumer unless otherwise agreed. Refunds will be issued within 14 days of receiving the returned product, using the original payment method.</p>
        <p>The right of withdrawal does not apply to personalized or made-to-measure products.</p>
      </Section>

      <Section title="8. Legal warranty of conformity">
        <p>Products are covered by a <strong>24-month</strong> legal warranty of conformity from delivery, under the Italian Consumer Code. To activate the warranty, contact {BUSINESS.email} with the order ID and a description of the defect.</p>
      </Section>

      <Section title="9. Product availability">
        <p>Products are sold in limited quantities as they come from existing stock. Availability shown on the Site is not guaranteed: if a product becomes unavailable after order, the customer will be promptly informed and any amount paid will be fully refunded.</p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>The seller is not liable for indirect damages, loss of profit, or consequential damages from product use, except as required by law.</p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>The seller may amend these Terms at any time. The version applicable to any order is the one published at the time the order is placed.</p>
      </Section>

      <Section title="12. Governing law and jurisdiction">
        <p>This contract is governed by Italian law. Any dispute is subject to the exclusive jurisdiction of the {BUSINESS.courtJurisdiction}, without prejudice to the consumer&apos;s mandatory forum.</p>
        <p>Consumers may also use the European Online Dispute Resolution platform: <a href="https://ec.europa.eu/consumers/odr" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>
      </Section>

      <Section title="13. Contact">
        <p>For any questions about these Terms, write to: {BUSINESS.email}</p>
      </Section>
    </>
  );
}
