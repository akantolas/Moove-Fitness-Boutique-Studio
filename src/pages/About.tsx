import { PageHeader } from '../components/PageHeader'
import { site } from '../site'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow="Σχετικά"
        title={site.ownerName}
        description={`Ιδρύτρια και γυμνάστρια του ${site.name}. Όλα τα μαθήματα διδάσκονται από αυτή, σε μικρά γκρουπ.`}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-moove-silver">
            Η φιλοσοφία
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-moove-muted sm:text-base">
            Το Pilates στο {site.name} δεν αντιμετωπίζεται ως απλή προπόνηση. Είναι αναπνοή,
            ευθυγράμμιση και έλεγχος κίνησης — με στόχο τη σταδιακή, ασφαλή πρόοδο.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted sm:text-base">
            Reformer, Mat, TRX και Bootycamp περνούν από την ίδια προσέγγιση: προσοχή στη
            τεχνική, διόρθωση όπου χρειάζεται και ρυθμός που σέβεται το σώμα. Το studio είναι
            ήσυχο, καθαρό και σχεδιασμένο για ουσιαστική δουλειά, χωρίς πίεση.
          </p>
        </section>

        <section className="overflow-hidden rounded-[1.25rem] border border-moove-border shadow-moove-soft">
          <img
            src="/image1.jpeg"
            alt={`${site.ownerName} — ${site.name}`}
            className="w-full h-auto"
            width={1349}
            height={1500}
          />
          <div className="bg-moove-surface/95 px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-moove-silver">
              Το studio
            </h2>
            <p className="mt-2 text-sm text-moove-muted">
              Φυσικό φως, καθαρές γραμμές και σύγχρονος εξοπλισμός — στην Κοραή, λίγα λεπτά
              από το κέντρο του Βόλου.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { src: '/image3.jpeg', alt: 'Μάθημα Pilates' },
          { src: '/image6.jpeg', alt: 'Reformer' },
          { src: '/card.png', alt: site.name },
        ].map((img) => (
          <div
            key={img.src}
            className="overflow-hidden rounded-2xl border border-moove-border/80 shadow-moove-lift"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
              width={400}
              height={300}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
