export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-moove-muted">
          Το studio
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-moove-silver sm:text-5xl">
          Σχετικά με το Moove
        </h1>
        <p className="mt-4 text-moove-muted leading-relaxed">
          Αντικαταστήστε αυτό το κείμενο με την πραγματική ιστορία του brand, την αποστολή
          σας και το γιατί «boutique» για εσάς σημαίνει συγκεκριμένα πράγματα.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
        <section className="rounded-2xl border border-moove-border bg-moove-surface/40 p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            Η φιλοσοφία μας
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted">
            Το Pilates, για εμάς, δεν είναι «άλλη μια προπόνηση». Είναι σύστημα που
            ενώνει αναπνοή, ευθυγράμμιση και έλεγχο. Σε μικρά γκρουπ, κάθε άνθρωπος
            παίρνει την προσοχή που χρειάζεται για να εξελιχθεί με ασφάλεια.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted">
            Συμπληρώστε εδώ credentials instructors, εκπαιδεύσεις και οτιδήποτε
            ενισχύει εμπιστοσύνη — χωρίς υπερβολή, με επαγγελματικό τόνο.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-moove-border bg-moove-bg/50 p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            Ο χώρος
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted">
            Προσθέστε τις δικές σας φωτογραφίες στο `public/` και εμφανίστε τες εδώ ως
            grid ή carousel. Για τώρα, το block σας υπενθυμίζει να επενδύσετε σε φωτογραφία
            υψηλής ποιότητας: ήσυχα φόντα, καθαρές γραμμές, φυσικό φως.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="aspect-[4/3] rounded-lg bg-moove-elevated/80 ring-1 ring-moove-border" />
            <div className="aspect-[4/3] rounded-lg bg-moove-elevated/80 ring-1 ring-moove-border" />
          </div>
        </section>
      </div>
    </div>
  )
}
