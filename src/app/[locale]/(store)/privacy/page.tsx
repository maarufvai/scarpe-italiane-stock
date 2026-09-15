import { getLocale } from "next-intl/server";
import Link from "next/link";

// ─── BUSINESS INFO ───────────────────────────────────────────────────────────
// Replace these placeholders with your actual data controller details.
const CONTROLLER = {
  companyName: "[REPLACE: Ragione sociale, es. Scarpe Italiane Stock S.r.l.]",
  vatNumber: "[REPLACE: Partita IVA]",
  registeredOffice: "[REPLACE: Sede legale, via, città, CAP, Italia]",
  email: "[REPLACE: privacy@scarpeitalianestock.it]",
  pec: "[REPLACE: pec@scarpeitalianestock.it]",
};

export default async function PrivacyPage() {
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
        {isIt ? "Informativa sulla Privacy" : "Privacy Policy"}
      </h1>
      <p className="text-sm text-stone-400 mb-10">
        {isIt
          ? `Ultimo aggiornamento: ${new Date().toLocaleDateString("it-IT")}`
          : `Last updated: ${new Date().toLocaleDateString("en-GB")}`}
      </p>

      <article className="prose-stone text-stone-700 dark:text-stone-300 leading-relaxed flex flex-col gap-6 text-sm">
        {isIt ? <ItalianPrivacy /> : <EnglishPrivacy />}
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

function ItalianPrivacy() {
  return (
    <>
      <Section title="1. Titolare del trattamento">
        <p>Il Titolare del trattamento è:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>{CONTROLLER.companyName}</li>
          <li>Sede legale: {CONTROLLER.registeredOffice}</li>
          <li>P.IVA: {CONTROLLER.vatNumber}</li>
          <li>Email: {CONTROLLER.email}</li>
          <li>PEC: {CONTROLLER.pec}</li>
        </ul>
        <p>La presente informativa è resa ai sensi del Regolamento (UE) 2016/679 (&quot;GDPR&quot;) e del D.Lgs. 196/2003 (Codice Privacy).</p>
      </Section>

      <Section title="2. Dati personali trattati">
        <p>Trattiamo le seguenti categorie di dati:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Dati anagrafici:</strong> nome, cognome.</li>
          <li><strong>Dati di contatto:</strong> email, numero di telefono.</li>
          <li><strong>Dati di spedizione:</strong> indirizzo, città, CAP, provincia.</li>
          <li><strong>Dati di pagamento:</strong> gestiti integralmente dai provider Stripe e PayPal; non conserviamo numeri di carta sui nostri server.</li>
          <li><strong>Dati di navigazione:</strong> log tecnici, indirizzo IP, cookie tecnici.</li>
          <li><strong>Dati account:</strong> se crei un account, l&apos;email e (per accesso con Google) i dati pubblici del profilo Google (nome, immagine).</li>
        </ul>
      </Section>

      <Section title="3. Finalità e basi giuridiche">
        <table className="w-full text-xs border border-stone-200 dark:border-stone-700 mt-2">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800">
              <th className="text-left p-2 border-b border-stone-200 dark:border-stone-700">Finalità</th>
              <th className="text-left p-2 border-b border-stone-200 dark:border-stone-700">Base giuridica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Esecuzione del contratto di vendita</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contratto</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Spedizione e tracciamento ordine</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contratto</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Adempimenti fiscali e contabili</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.c GDPR — obbligo di legge</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Gestione account e accesso</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contratto</td>
            </tr>
            <tr>
              <td className="p-2">Sicurezza del sito e prevenzione frodi</td>
              <td className="p-2">Art. 6.1.f GDPR — legittimo interesse</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Conferimento dei dati">
        <p>Il conferimento dei dati indicati come obbligatori in fase di checkout (nome, cognome, email, telefono, indirizzo di spedizione) è necessario per la conclusione e l&apos;esecuzione del contratto. Il mancato conferimento rende impossibile evadere l&apos;ordine.</p>
      </Section>

      <Section title="5. Destinatari dei dati">
        <p>I dati possono essere comunicati ai seguenti soggetti, in qualità di responsabili o autonomi titolari del trattamento:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Stripe Payments Europe Ltd.</strong> — gestione pagamenti con carta.</li>
          <li><strong>PayPal (Europe) S.à r.l. et Cie, S.C.A.</strong> — gestione pagamenti PayPal.</li>
          <li><strong>Corrieri (BRT, GLS, Poste Italiane)</strong> — consegna degli ordini.</li>
          <li><strong>Supabase (hosting database)</strong> — server localizzati nell&apos;UE.</li>
          <li><strong>Hostinger</strong> — hosting del sito.</li>
          <li><strong>Google LLC</strong> — autenticazione tramite Google (se utilizzata).</li>
          <li>Autorità competenti, in caso di obbligo di legge.</li>
        </ul>
      </Section>

      <Section title="6. Trasferimento dei dati all'estero">
        <p>I dati sono trattati prevalentemente all&apos;interno dello Spazio Economico Europeo. Alcuni fornitori (es. Google) possono trattare dati anche al di fuori dell&apos;UE; in tal caso, il trasferimento avviene tramite Clausole Contrattuali Standard approvate dalla Commissione Europea o altre garanzie adeguate.</p>
      </Section>

      <Section title="7. Periodo di conservazione">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Dati ordine e fatturazione:</strong> 10 anni (obblighi fiscali italiani).</li>
          <li><strong>Dati account:</strong> fino alla richiesta di cancellazione dell&apos;account.</li>
          <li><strong>Log tecnici di sicurezza:</strong> massimo 12 mesi.</li>
          <li><strong>Cookie tecnici:</strong> durata della sessione.</li>
        </ul>
      </Section>

      <Section title="8. Diritti dell'interessato">
        <p>In qualità di interessato, hai il diritto di:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>accedere ai tuoi dati (art. 15 GDPR);</li>
          <li>rettificare dati inesatti (art. 16 GDPR);</li>
          <li>cancellare i tuoi dati (art. 17 GDPR), fatti salvi gli obblighi di conservazione;</li>
          <li>limitare il trattamento (art. 18 GDPR);</li>
          <li>portabilità dei dati (art. 20 GDPR);</li>
          <li>opporti al trattamento basato su legittimo interesse (art. 21 GDPR);</li>
          <li>revocare il consenso, ove applicabile.</li>
        </ul>
        <p>Per esercitare i tuoi diritti, scrivi a: {CONTROLLER.email}</p>
        <p>Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).</p>
      </Section>

      <Section title="9. Cookie">
        <p>Il sito utilizza:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Cookie tecnici:</strong> necessari per il funzionamento (sessione, carrello, preferenze lingua/tema). Non richiedono consenso.</li>
          <li><strong>Cookie di autenticazione:</strong> per mantenere la sessione di login (NextAuth).</li>
        </ul>
        <p>Il sito non utilizza cookie di profilazione né tracciamento di terze parti senza tuo esplicito consenso.</p>
      </Section>

      <Section title="10. Sicurezza">
        <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati: connessioni HTTPS, hashing delle password, accesso limitato ai database, backup regolari.</p>
      </Section>

      <Section title="11. Modifiche all'informativa">
        <p>Ci riserviamo il diritto di aggiornare la presente informativa. La versione corrente è sempre consultabile su questa pagina.</p>
      </Section>

      <Section title="12. Contatti">
        <p>Per qualsiasi domanda sulla privacy: {CONTROLLER.email}</p>
      </Section>
    </>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <Section title="1. Data controller">
        <p>The data controller is:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>{CONTROLLER.companyName}</li>
          <li>Registered office: {CONTROLLER.registeredOffice}</li>
          <li>VAT no.: {CONTROLLER.vatNumber}</li>
          <li>Email: {CONTROLLER.email}</li>
          <li>Certified email (PEC): {CONTROLLER.pec}</li>
        </ul>
        <p>This notice is provided under Regulation (EU) 2016/679 (&quot;GDPR&quot;) and Italian Legislative Decree 196/2003.</p>
      </Section>

      <Section title="2. Personal data processed">
        <p>We process the following categories of data:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Identity data:</strong> first name, last name.</li>
          <li><strong>Contact data:</strong> email, phone number.</li>
          <li><strong>Shipping data:</strong> address, city, postal code, province.</li>
          <li><strong>Payment data:</strong> handled entirely by Stripe and PayPal; we do not store card numbers on our servers.</li>
          <li><strong>Navigation data:</strong> technical logs, IP address, technical cookies.</li>
          <li><strong>Account data:</strong> if you create an account, your email and (for Google sign-in) Google profile data (name, image).</li>
        </ul>
      </Section>

      <Section title="3. Purposes and legal bases">
        <table className="w-full text-xs border border-stone-200 dark:border-stone-700 mt-2">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800">
              <th className="text-left p-2 border-b border-stone-200 dark:border-stone-700">Purpose</th>
              <th className="text-left p-2 border-b border-stone-200 dark:border-stone-700">Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Performance of the sales contract</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contract</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Shipping and order tracking</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contract</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Tax and accounting obligations</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.c GDPR — legal obligation</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Account management and sign-in</td>
              <td className="p-2 border-b border-stone-100 dark:border-stone-800">Art. 6.1.b GDPR — contract</td>
            </tr>
            <tr>
              <td className="p-2">Site security and fraud prevention</td>
              <td className="p-2">Art. 6.1.f GDPR — legitimate interest</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Data provision">
        <p>Providing the data marked as required at checkout (first name, last name, email, phone, shipping address) is necessary to conclude and perform the contract. Without it, we cannot fulfill the order.</p>
      </Section>

      <Section title="5. Data recipients">
        <p>Data may be shared with the following parties, as processors or independent controllers:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Stripe Payments Europe Ltd.</strong> — card payment processing.</li>
          <li><strong>PayPal (Europe) S.à r.l. et Cie, S.C.A.</strong> — PayPal payment processing.</li>
          <li><strong>Couriers (BRT, GLS, Poste Italiane)</strong> — order delivery.</li>
          <li><strong>Supabase (database hosting)</strong> — EU-based servers.</li>
          <li><strong>Hostinger</strong> — site hosting.</li>
          <li><strong>Google LLC</strong> — Google sign-in (if used).</li>
          <li>Competent authorities, where required by law.</li>
        </ul>
      </Section>

      <Section title="6. International data transfers">
        <p>Data is mainly processed within the European Economic Area. Some providers (e.g. Google) may process data outside the EU; in that case, transfers are made under Standard Contractual Clauses approved by the European Commission or other adequate safeguards.</p>
      </Section>

      <Section title="7. Retention period">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Order and invoicing data:</strong> 10 years (Italian tax obligations).</li>
          <li><strong>Account data:</strong> until account deletion is requested.</li>
          <li><strong>Security logs:</strong> max 12 months.</li>
          <li><strong>Technical cookies:</strong> session duration.</li>
        </ul>
      </Section>

      <Section title="8. Your rights">
        <p>As a data subject, you have the right to:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>access your data (Art. 15 GDPR);</li>
          <li>rectify inaccurate data (Art. 16 GDPR);</li>
          <li>delete your data (Art. 17 GDPR), subject to retention obligations;</li>
          <li>restrict processing (Art. 18 GDPR);</li>
          <li>data portability (Art. 20 GDPR);</li>
          <li>object to processing based on legitimate interest (Art. 21 GDPR);</li>
          <li>withdraw consent, where applicable.</li>
        </ul>
        <p>To exercise your rights, write to: {CONTROLLER.email}</p>
        <p>You also have the right to lodge a complaint with the Italian Data Protection Authority (<a href="https://www.garanteprivacy.it" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).</p>
      </Section>

      <Section title="9. Cookies">
        <p>The site uses:</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li><strong>Technical cookies:</strong> required for operation (session, cart, language/theme preferences). No consent required.</li>
          <li><strong>Authentication cookies:</strong> to maintain your login session (NextAuth).</li>
        </ul>
        <p>The site does not use profiling cookies or third-party tracking without your explicit consent.</p>
      </Section>

      <Section title="10. Security">
        <p>We adopt appropriate technical and organizational measures to protect your data: HTTPS connections, password hashing, restricted database access, regular backups.</p>
      </Section>

      <Section title="11. Changes to this notice">
        <p>We reserve the right to update this notice. The current version is always available on this page.</p>
      </Section>

      <Section title="12. Contact">
        <p>For any privacy questions: {CONTROLLER.email}</p>
      </Section>
    </>
  );
}
