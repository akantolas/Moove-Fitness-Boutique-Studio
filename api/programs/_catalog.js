/**
 * Server-only program content (videos, exercises). Not exposed without valid access token.
 */

const PEACH_BUILD_WARMUP_SECTION = {
  title: { el: 'Προθέρμανση (κοινό Peach Build)', en: 'Warm up (shared Peach Build)' },
  exercises: [
    {
      name: { el: 'Deep Bodyweight Squat', en: 'Deep Bodyweight Squat' },
      sets: '10',
      notes: {
        el: '10 βαθιά καθίσματα με το βάρος του σώματος.',
        en: '10 deep bodyweight squats.',
      },
    },
    {
      name: { el: 'Hip Openers', en: 'Hip Openers' },
      sets: '10 ανά πλευρά',
      notes: {
        el: 'Ανοίγματα/διατάσεις ισχίου για κάθε πλευρά.',
        en: 'Hip openers for each side.',
      },
    },
    {
      name: { el: 'Glute Bridge', en: 'Glute Bridge' },
      sets: '15',
      notes: {
        el: 'Γέφυρα γλουτών.',
        en: 'Glute bridges.',
      },
    },
    {
      name: { el: 'Standing Band Abduction', en: 'Standing Band Abduction' },
      sets: '15 ανά πλευρά',
      notes: {
        el: 'Απαγωγές ποδιού από όρθια θέση με λάστιχο.',
        en: 'Standing leg abduction with a band.',
      },
    },
    {
      name: { el: 'Σημείωση προθέρμανσης', en: 'Warm-up note' },
      notes: {
        el: 'Πρόσθεσε σετ προθέρμανσης όπου χρειάζεται. 1–2 σετ πολύ ελαφρύ βάρος με σταδιακή άνοδο για να μπεις στα βασικά κιλά του working set.',
        en: 'Add warm-up sets wherever needed. 1–2 sets with very light weight and a gradual increase to reach your working-set weight.',
      },
    },
  ],
}

const PEACH_BUILD_LOAD_PLAN = {
  el: 'Load plan: Εβδομάδες 1–2: εστίαση στην τεχνική και εύρεση βαρών με ~2 RIR. Εβδομάδες 3–4: αύξηση 2,5–5% όταν ολοκληρώνονται όλες οι επαναλήψεις με σωστή φόρμα. Εβδομάδες 5–6: κοντά σε muscular failure στο τελευταίο working set κάθε κύριας άσκησης, με τέλεια τεχνική.',
  en: 'Load plan: Weeks 1–2: focus on mastering technique and find loads leaving ~2 RIR. Weeks 3–4: increase load 2.5–5% when all prescribed reps are completed with proper form. Weeks 5–6: train close to muscular failure on the final work set of each primary exercise while maintaining excellent technique.',
}

const PEACH_BUILD_DURATION = {
  el: '6 εβδομάδες / Intensive — Glute Hypertrophy (4 εβδομάδες έργο / 1 αποφόρτιση ή μετάβαση)',
  en: '6 weeks / Intensive — Glute Hypertrophy (4 weeks work / 1 deload or transition)',
}

/** @type {Record<string, { meta: { duration: { el: string; en: string }; goal: { el: string; en: string }; progressNote: { el: string; en: string } }; sections: Array<{ title: { el: string; en: string }; exercises: Array<{ name: { el: string; en: string }; sets?: string; notes?: { el: string; en: string }; videoId?: string }> }> }>} */
export const PROGRAM_CONTENT = {
  peach_start: {
    meta: {
      duration: {
        el: '4 εβδομάδες (3 προπονήσεις την εβδομάδα)',
        en: '4 weeks (3 workouts per week)',
      },
      goal: {
        el: 'Χτίσιμο δυνατότερων γλουτών παράλληλα με την εκμάθηση της σωστής τεχνικής.',
        en: 'Building stronger glutes while learning proper technique.',
      },
      progressNote: {
        el: 'Σήκωνε βαρύτερα κιλά κάθε εβδομάδα ή κάνε μερικές επαναλήψεις παραπάνω, διατηρώντας την τέλεια φόρμα/τεχνική.',
        en: 'Lift heavier each week or add a few more reps while keeping perfect form.',
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Διάδρομος', en: 'Treadmill' },
            sets: '5 λεπτά',
            notes: {
              el: 'Περπάτημα για 5 λεπτά.',
              en: 'Walk for 5 minutes.',
            },
          },
        ],
      },
      {
        title: { el: 'Ενεργοποίηση γλουτών', en: 'Glute activation' },
        exercises: [
          {
            name: { el: 'Banded Glute Bridge', en: 'Banded Glute Bridge' },
            sets: '2 x 15',
            notes: {
              el: 'Γέφυρα γλουτών με λάστιχο.',
              en: 'Glute bridge with resistance band.',
            },
          },
          {
            name: { el: 'Banded Lateral Walk', en: 'Banded Lateral Walk' },
            sets: '2 x 12 ανά πλευρά',
            notes: {
              el: 'Πλάγιο περπάτημα με λάστιχο.',
              en: 'Lateral walk with resistance band.',
            },
          },
          {
            name: { el: 'Bodyweight Squat', en: 'Bodyweight Squat' },
            sets: '2 x 15',
            notes: {
              el: 'Καθίσματα με το βάρος του σώματος.',
              en: 'Squats with body weight.',
            },
          },
        ],
      },
      {
        title: { el: 'Κύριο πρόγραμμα', en: 'Main workout' },
        exercises: [
          {
            name: { el: 'Goblet Squat', en: 'Goblet Squat' },
            sets: '3 x 12',
            notes: {
              el: 'Καθίσματα με βαράκι μπροστά στο στήθος.',
              en: 'Squats with a weight held at the chest.',
            },
          },
          {
            name: { el: 'Barbell Hip Thrust', en: 'Barbell Hip Thrust' },
            sets: '3 x 12',
            notes: {
              el: 'Hip thrusts με μπάρα.',
              en: 'Hip thrusts with a barbell.',
            },
          },
          {
            name: { el: 'RDL (Romanian Deadlifts)', en: 'RDL (Romanian Deadlifts)' },
            sets: '3 x 10',
            notes: {
              el: 'Ρουμάνικες άρσεις θανάτου.',
              en: 'Romanian deadlifts.',
            },
          },
          {
            name: { el: 'Walking Lunges', en: 'Walking Lunges' },
            sets: '3 x 10 ανά πόδι',
            notes: {
              el: 'Προβολές σε κίνηση.',
              en: 'Walking lunges.',
            },
          },
          {
            name: { el: 'Seated Hip Abduction', en: 'Seated Hip Abduction' },
            sets: '3 x 15',
            notes: {
              el: 'Απαγωγοί ισχίου από καθιστή θέση.',
              en: 'Seated hip abduction.',
            },
          },
        ],
      },
      {
        title: { el: 'Τελείωμα & διατάσεις', en: 'Finisher & stretch' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '2 x 25',
            notes: {
              el: 'Γέφυρες με τα πέλματα ενωμένα.',
              en: 'Bridges with soles of the feet together.',
            },
          },
          {
            name: { el: 'Διατάσεις', en: 'Stretch' },
            notes: {
              el: 'Διατάσεις για καμπτήρες του ισχίου (hip flexors), γλουτούς (glutes) και οπίσθιους μηριαίους (hams).',
              en: 'Stretch hip flexors, glutes, and hamstrings.',
            },
          },
        ],
      },
    ],
  },
  peach_workout_b: {
    meta: {
      duration: {
        el: '4 εβδομάδες (3 προπονήσεις την εβδομάδα)',
        en: '4 weeks (3 workouts per week)',
      },
      goal: {
        el: 'Χτίσιμο δυνατότερων γλουτών παράλληλα με την εκμάθηση της σωστής τεχνικής.',
        en: 'Building stronger glutes while learning proper technique.',
      },
      progressNote: {
        el: 'Σήκωνε βαρύτερα κιλά κάθε εβδομάδα ή κάνε μερικές επαναλήψεις παραπάνω, διατηρώντας την τέλεια φόρμα/τεχνική.',
        en: 'Lift heavier each week or add a few more reps while keeping perfect form.',
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Διάδρομος', en: 'Treadmill' },
            sets: '15 λεπτά',
            notes: {
              el: 'Περπάτημα για 15 λεπτά.',
              en: 'Walk for 15 minutes.',
            },
          },
        ],
      },
      {
        title: { el: 'Ενεργοποίηση γλουτών', en: 'Glute activation' },
        exercises: [
          {
            name: { el: 'Clamshell', en: 'Clamshell' },
            sets: '2 x 15',
            notes: {
              el: 'Ασκήσεις «κοχύλι».',
              en: 'Clamshell exercise.',
            },
          },
          {
            name: { el: 'Fire Hydrant', en: 'Fire Hydrant' },
            sets: '2 x 15 ανά πόδι',
            notes: {
              el: 'Fire hydrant.',
              en: 'Fire hydrant.',
            },
          },
        ],
      },
      {
        title: { el: 'Κύριο πρόγραμμα', en: 'Main workout' },
        exercises: [
          {
            name: { el: 'Leg Press (Glute Focus)', en: 'Leg Press (Glute Focus)' },
            sets: '3 x 12',
            notes: {
              el: 'Πρέσα ποδιών με έμφαση στους γλουτούς.',
              en: 'Leg press with glute emphasis.',
            },
          },
          {
            name: { el: 'Bulgarian Split Squat', en: 'Bulgarian Split Squat' },
            sets: '3 x 10 ανά πόδι',
            notes: {
              el: 'Βουλγάρικα καθίσματα.',
              en: 'Bulgarian split squats.',
            },
          },
          {
            name: { el: 'Dumbbell RDL', en: 'Dumbbell RDL' },
            sets: '3 x 12',
            notes: {
              el: 'Ρουμανικές άρσεις θανάτου με αλτήρες.',
              en: 'Romanian deadlifts with dumbbells.',
            },
          },
          {
            name: { el: 'Cable Kickback', en: 'Cable Kickback' },
            sets: '3 x 15 ανά πόδι',
            notes: {
              el: 'Εκτάσεις γλουτών στην τροχαλία.',
              en: 'Cable glute kickback.',
            },
          },
          {
            name: { el: 'Standing Hip Abduction', en: 'Standing Hip Abduction' },
            sets: '3 x 15',
            notes: {
              el: 'Απαγωγές ισχίου σε όρθια θέση.',
              en: 'Standing hip abduction.',
            },
          },
        ],
      },
      {
        title: { el: 'Τελείωμα & διατάσεις', en: 'Finisher & stretch' },
        exercises: [
          {
            name: { el: 'Glute Bridge Pulses', en: 'Glute Bridge Pulses' },
            sets: '2 x 30',
            notes: {
              el: 'Μικρές παλμικές κινήσεις σε γέφυρα γλουτών.',
              en: 'Small pulsing movements in glute bridge.',
            },
          },
          {
            name: { el: 'Διατάσεις', en: 'Stretch' },
            notes: {
              el: 'Διατάσεις για προσαγωγούς (adductors), γλουτούς (glutes) και καμπτήρες του ισχίου (hip flexors).',
              en: 'Stretch adductors, glutes, and hip flexors.',
            },
          },
        ],
      },
    ],
  },
  peach_workout_c: {
    meta: {
      duration: {
        el: '4 εβδομάδες (3 προπονήσεις την εβδομάδα)',
        en: '4 weeks (3 workouts per week)',
      },
      goal: {
        el: 'Χτίσιμο δυνατότερων γλουτών παράλληλα με την εκμάθηση της σωστής τεχνικής.',
        en: 'Building stronger glutes while learning proper technique.',
      },
      progressNote: {
        el: 'Εβδομάδα 1: Μάθε τις ασκήσεις και εστίασε στην τεχνική. Εβδομάδα 2: Αύξησε βάρος αν οι επαναλήψεις είναι άνετες. Εβδομάδα 3: Λίγο βαρύτερα ή +1–2 επαναλήψεις. Εβδομάδα 4: Η δυνατότερη εβδομάδα με τέλεια τεχνική.',
        en: 'Week 1: Learn the exercises and focus on technique. Week 2: Increase weight if reps are comfortable. Week 3: Lift slightly heavier or add 1–2 reps. Week 4: Aim for your strongest week with perfect technique.',
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Διάδρομος', en: 'Treadmill' },
            sets: '5 λεπτά',
            notes: {
              el: 'Περπάτημα για 5 λεπτά.',
              en: 'Walk for 5 minutes.',
            },
          },
        ],
      },
      {
        title: { el: 'Ενεργοποίηση γλουτών', en: 'Glute activation' },
        exercises: [
          {
            name: { el: 'Monster Walk', en: 'Monster Walk' },
            sets: '2 x 12',
            notes: {
              el: 'Monster walk με λάστιχο.',
              en: 'Banded monster walk.',
            },
          },
          {
            name: { el: 'Donkey Kick', en: 'Donkey Kick' },
            sets: '2 x 15',
            notes: {
              el: 'Donkey kick.',
              en: 'Donkey kick.',
            },
          },
          {
            name: { el: 'Bodyweight Squat', en: 'Bodyweight Squat' },
            sets: '2 x 15',
            notes: {
              el: 'Καθίσματα με το βάρος του σώματος.',
              en: 'Squats with body weight.',
            },
          },
        ],
      },
      {
        title: { el: 'Κύριο πρόγραμμα', en: 'Main workout' },
        exercises: [
          {
            name: { el: 'Hip Thrust', en: 'Hip Thrust' },
            sets: '4 x 15',
            notes: {
              el: 'Hip thrust.',
              en: 'Hip thrust.',
            },
          },
          {
            name: { el: 'Sumo Squat', en: 'Sumo Squat' },
            sets: '3 x 12',
            notes: {
              el: 'Sumo squat (Smith ή αλτήρες).',
              en: 'Sumo squat (Smith machine or dumbbells).',
            },
          },
          {
            name: { el: 'Step Up', en: 'Step Up' },
            sets: '3 x 10 ανά πόδι',
            notes: {
              el: 'Step up με κουτί/box.',
              en: 'Step up using a box.',
            },
          },
          {
            name: { el: 'Cable Pull Through', en: 'Cable Pull Through' },
            sets: '3 x 12',
            notes: {
              el: 'Cable pull through.',
              en: 'Cable pull through.',
            },
          },
          {
            name: { el: 'Seated Hip Abduction', en: 'Seated Hip Abduction' },
            sets: '3 x 20',
            notes: {
              el: 'Απαγωγοί ισχίου από καθιστή θέση.',
              en: 'Seated hip abduction.',
            },
          },
        ],
      },
      {
        title: { el: 'Τελείωμα & διατάσεις', en: 'Finisher & stretch' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '30 επαναλήψεις',
            notes: {
              el: 'Γέφυρες με τα πέλματα ενωμένα.',
              en: 'Bridges with soles of the feet together.',
            },
          },
          {
            name: { el: 'Διατάσεις', en: 'Stretch' },
            notes: {
              el: 'Διατάσεις για γλουτούς και οπίσθιους μηριαίους (glutes/hams) και καμπτήρες του ισχίου (hip flexors).',
              en: 'Stretch glutes and hamstrings, and hip flexors.',
            },
          },
        ],
      },
    ],
  },
  peach_build_wa_heavy: {
    meta: {
      duration: PEACH_BUILD_DURATION,
      goal: {
        el: 'Ανάπτυξη μέγιστης δύναμης στους γλουτούς μέσα από βαριές σύνθετες ασκήσεις, θέτοντας τις βάσεις για προοδευτική επιβάρυνση. Φιλοσοφία: αύξηση όγκου προπόνησης, progressive overload, νοητική σύνδεση μυός-μυαλού.',
        en: 'Build maximum glute strength through heavy compound lifts while setting the foundation for progressive overload. Philosophy: increase training volume, progressive overload, and mind-muscle connection.',
      },
      progressNote: {
        el: `${PEACH_BUILD_LOAD_PLAN.el} Mindset: Εδώ δεν πάμε για μεγάλες τεχνικές — ο πρωταρχικός στόχος είναι να νιώσεις να δουλεύει περισσότερο. Ενεργοποίηση για μέγιστη δύναμη. Χρόνος ξεκούρασης: 35–40″ ανάμεσα στα σετ.`,
        en: `${PEACH_BUILD_LOAD_PLAN.en} Mindset: Here we are not chasing advanced techniques — the primary goal is to feel the glutes working more. Activation for maximum strength. Rest: 35–40 seconds between sets.`,
      },
    },
    sections: [
      PEACH_BUILD_WARMUP_SECTION,
      {
        title: { el: 'WA Heavy Glutes', en: 'WA Heavy Glutes' },
        exercises: [
          {
            name: { el: 'Barbell Hip Thrusts', en: 'Barbell Hip Thrusts' },
            sets: '4 x 6-8',
            notes: {
              el: 'Η ημέρα εστιάζει σε βαριά φορτία για τους γλουτούς.',
              en: 'This session focuses on heavy loads for the glutes.',
            },
          },
          {
            name: { el: 'High Bar Squat', en: 'High Bar Squat' },
            sets: '4 x 8-10',
          },
          {
            name: { el: 'RDL (Romanian Deadlifts)', en: 'RDL (Romanian Deadlifts)' },
            sets: '3 x 8-10',
          },
          {
            name: { el: 'Seated Hip Abd. (Front bent)', en: 'Seated Hip Abd. (Front bent)' },
            sets: '3 x 12 + 5',
            notes: {
              el: 'Απαγωγοί ισχίου από καθιστή θέση, κυφή στάση.',
              en: 'Seated hip abduction, front-bent position.',
            },
          },
        ],
      },
      {
        title: { el: 'Τελείωμα — Superset', en: 'Finisher — Superset' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '1 x 40',
            notes: {
              el: '2 γύροι ως superset — συνεχόμενα με Banded Abd. χωρίς διάλειμμα.',
              en: '2 rounds as superset — immediately followed by Banded Abd. with no break.',
            },
          },
          {
            name: { el: 'Banded Abd.', en: 'Banded Abd.' },
            sets: '1 x 30',
            notes: {
              el: '2 γύροι ως superset — αμέσως μετά τα Frog Pumps.',
              en: '2 rounds as superset — immediately after Frog Pumps.',
            },
          },
        ],
      },
    ],
  },
  peach_build_wb: {
    meta: {
      duration: PEACH_BUILD_DURATION,
      goal: {
        el: 'Βελτίωση μονομερούς δύναμης, διόρθωση ασυμμετριών μεταξύ των δύο πλευρών και αύξηση της ενεργοποίησης των γλουτών μέσα από κινητικά πρότυπα του ενός ποδιού.',
        en: 'Improve unilateral strength, correct asymmetries between both sides, and increase glute activation through single-leg movement patterns.',
      },
      progressNote: {
        el: `${PEACH_BUILD_LOAD_PLAN.el} Χρόνος ξεκούρασης: 35–40″ ανάμεσα στα σετ.`,
        en: `${PEACH_BUILD_LOAD_PLAN.en} Rest: 35–40 seconds between sets.`,
      },
    },
    sections: [
      PEACH_BUILD_WARMUP_SECTION,
      {
        title: { el: 'Glute & Unilateral Strength', en: 'Glute & Unilateral Strength' },
        exercises: [
          {
            name: { el: 'Walking Lunges', en: 'Walking Lunges' },
            sets: '3 x 12',
          },
          {
            name: { el: 'Bulgarian Split Squats', en: 'Bulgarian Split Squats' },
            sets: '4 x 10',
          },
          {
            name: { el: 'Step Ups (Weighted)', en: 'Step Ups (Weighted)' },
            sets: '3 x 12',
          },
          {
            name: { el: 'Single Leg Hip Thrust', en: 'Single Leg Hip Thrust' },
            sets: '3 x 12',
          },
          {
            name: { el: 'Standing Cable Abduction', en: 'Standing Cable Abduction' },
            sets: '3 x 15',
          },
        ],
      },
      {
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Reverse Lunges B. Weighted', en: 'Reverse Lunges B. Weighted' },
            sets: '2 x σχεδόν τεχνική αστοχία',
            notes: {
              el: 'Ξεκούραση 35–40″ ανάμεσα στα σετ.',
              en: 'Rest 35–40 seconds between sets.',
            },
          },
        ],
      },
    ],
  },
  peach_build_wc: {
    meta: {
      duration: PEACH_BUILD_DURATION,
      goal: {
        el: 'Ανάπτυξη των γλουτών στη θέση επιμήκυνσης, ενώ παράλληλα ενδυναμώνεται ολόκληρη η οπίσθια αλυσίδα για καλύτερη μυϊκή ανάπτυξη και συνολική απόδοση.',
        en: 'Develop the glutes in the lengthened position while strengthening the entire posterior chain for better muscle development and overall performance.',
      },
      progressNote: {
        el: `${PEACH_BUILD_LOAD_PLAN.el} Χρόνος ξεκούρασης: 35–40″ ανάμεσα στα σετ.`,
        en: `${PEACH_BUILD_LOAD_PLAN.en} Rest: 35–40 seconds between sets.`,
      },
    },
    sections: [
      PEACH_BUILD_WARMUP_SECTION,
      {
        title: { el: 'Posterior Chain', en: 'Posterior Chain' },
        exercises: [
          {
            name: { el: 'RDLs (Romanian Deadlifts)', en: 'RDLs (Romanian Deadlifts)' },
            sets: '4 x 8',
          },
          {
            name: { el: '45° Back Extension (Glute Bias, Weighted)', en: '45° Back Extension (Glute Bias, Weighted)' },
            sets: '3 x 12-15',
          },
          {
            name: { el: 'Cable Pull Through', en: 'Cable Pull Through' },
            sets: '3 x 12',
          },
          {
            name: { el: 'Leg Press (High Stance)', en: 'Leg Press (High Stance)' },
            sets: '3 x 12',
          },
          {
            name: { el: 'Cable Abduction', en: 'Cable Abduction' },
            sets: '3 x 15-20',
          },
        ],
      },
      {
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Abduction Machine', en: 'Abduction Machine' },
            sets: '80-100 επαναλήψεις',
            notes: {
              el: 'Συνολικές επαναλήψεις.',
              en: 'Total repetitions.',
            },
          },
        ],
      },
    ],
  },
  peach_build_wd: {
    meta: {
      duration: PEACH_BUILD_DURATION,
      goal: {
        el: 'Ανάπτυξη όγκου και pump στους γλουτούς μέσα από υψηλότερο training volume, συνδυασμό ασκήσεων και έμφαση στη νοητική σύνδεση μυός-μυαλού.',
        en: 'Build glute volume and pump through higher training volume, exercise variety, and strong mind-muscle connection.',
      },
      progressNote: {
        el: `${PEACH_BUILD_LOAD_PLAN.el} Χρόνος ξεκούρασης: 35–40″ ανάμεσα στα σετ (και στο τέλος κάθε γύρου του finisher).`,
        en: `${PEACH_BUILD_LOAD_PLAN.en} Rest: 35–40 seconds between sets (and at the end of each finisher round).`,
      },
    },
    sections: [
      PEACH_BUILD_WARMUP_SECTION,
      {
        title: { el: 'Glute Volume & Pump', en: 'Glute Volume & Pump' },
        exercises: [
          {
            name: { el: 'Hip Thrust', en: 'Hip Thrust' },
            sets: '4 x 10-12',
          },
          {
            name: { el: 'Smith Reverse Lunge', en: 'Smith Reverse Lunge' },
            sets: '3 x 12',
            notes: {
              el: 'Προβολές προς τα πίσω στο μηχάνημα Smith.',
              en: 'Reverse lunges on the Smith machine.',
            },
          },
          {
            name: { el: 'Leg Press Wide Stance', en: 'Leg Press Wide Stance' },
            sets: '3 x 15',
            notes: {
              el: 'Πρέσα ποδιών με ανοιχτό πάτημα για έμφαση στους γλουτούς.',
              en: 'Leg press with a wide stance for glute emphasis.',
            },
          },
          {
            name: { el: 'Cable Kickback (from bent position)', en: 'Cable Kickback (from bent position)' },
            sets: '3 x 15',
            notes: {
              el: 'Εκτάσεις ποδιών στην τροχαλία από σκυφτή θέση.',
              en: 'Cable kickback from a bent-over position.',
            },
          },
          {
            name: { el: 'Seated Abduction (lay back)', en: 'Seated Abduction (lay back)' },
            sets: '3 x 20',
            notes: {
              el: 'Απαγωγοί σε μηχάνημα με κλίση του κορμού προς τα πίσω.',
              en: 'Seated abduction with torso leaning back.',
            },
          },
        ],
      },
      {
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '15-20',
            notes: {
              el: '2 γύροι — με μπάρα στους γοφούς. Ξεκούραση 35–40″ στο τέλος κάθε γύρου.',
              en: '2 rounds — with a barbell on the hips. Rest 35–40 seconds at the end of each round.',
            },
          },
          {
            name: { el: 'Reverse Banded Abduction Hold', en: 'Reverse Banded Abduction Hold' },
            sets: '30 δευτερόλεπτα',
            notes: {
              el: '2 γύροι — κράτημα 30″. Ξεκούραση 35–40″ στο τέλος κάθε γύρου.',
              en: '2 rounds — 30-second hold. Rest 35–40 seconds at the end of each round.',
            },
          },
        ],
      },
    ],
  },
}

export function getProgramContentForApi(programKey, locale = 'el') {
  const raw = PROGRAM_CONTENT[programKey]
  if (!raw) return null
  const isEl = locale !== 'en'

  return {
    meta: raw.meta
      ? {
          duration: isEl ? raw.meta.duration.el : raw.meta.duration.en,
          goal: isEl ? raw.meta.goal.el : raw.meta.goal.en,
          progressNote: isEl ? raw.meta.progressNote.el : raw.meta.progressNote.en,
        }
      : undefined,
    sections: raw.sections.map((section) => ({
      title: isEl ? section.title.el : section.title.en,
      exercises: section.exercises.map((ex) => ({
        name: isEl ? ex.name.el : ex.name.en,
        sets: ex.sets ?? null,
        notes: ex.notes ? (isEl ? ex.notes.el : ex.notes.en) : null,
        videoId: ex.videoId ?? null,
      })),
    })),
  }
}
