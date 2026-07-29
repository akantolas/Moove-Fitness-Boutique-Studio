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

const PEACH_SCULPT_DURATION = {
  el: '8 εβδομάδες (4–5 προπονήσεις την εβδομάδα)',
  en: '8 weeks (4–5 workouts per week)',
}

const PEACH_SCULPT_LOAD_PLAN = {
  el: 'Εβδομάδες 1–2: μάθε την τεχνική (~2 RIR). Εβδομάδες 3–4: αύξηση όγκου, πρόσθεσε supersets (~1,5–1 RIR). Εβδομάδες 5–6: αύξηση έντασης, drop sets (~0,5–0 RIR) και αποφόρτιση. Εβδομάδες 7–8: κορύφωση ενεργοποίησης — βαριά φορτία, full supersets, drop sets, rest-pause και finishers.',
  en: 'Weeks 1–2: learn technique (~2 RIR). Weeks 3–4: increase volume, add supersets (~1.5–1 RIR). Weeks 5–6: increase intensity with drop sets (~0.5–0 RIR), then deload. Weeks 7–8: peak activation — heavy loads, full supersets, drop sets, rest-pause, and finishers.',
}

const PEACH_COOL_DOWN_SECTION = {
  title: { el: 'Αποθεραπεία', en: 'Cool down' },
  exercises: [
    {
      name: { el: 'Pigeon Stretch', en: 'Pigeon Stretch' },
      sets: '30–45″ ανά πλευρά',
    },
    {
      name: { el: 'Hip Flexor (Psoas) Stretch', en: 'Hip Flexor (Psoas) Stretch' },
      sets: '30–45″ ανά πλευρά',
    },
    {
      name: { el: 'Standing Hamstring Stretch', en: 'Standing Hamstring Stretch' },
      sets: '30–45″ ανά πλευρά',
    },
    {
      name: { el: 'Figure 4 Glute Stretch', en: 'Figure 4 Glute Stretch' },
      sets: '30–45″ ανά πλευρά',
    },
    {
      name: { el: 'Quad Stretch', en: 'Quad Stretch' },
      sets: '30–45″ ανά πλευρά',
    },
    {
      name: { el: 'Butterfly Stretch', en: 'Butterfly Stretch' },
      sets: '30–45″',
    },
    {
      name: { el: "Child's Pose", en: "Child's Pose" },
      sets: '45–60″',
    },
  ],
}

function mapSectionForApi(section, isEl) {
  return {
    title: isEl ? section.title.el : section.title.en,
    exercises: section.exercises.map((ex) => ({
      name: isEl ? ex.name.el : ex.name.en,
      sets: ex.sets ?? null,
      notes: ex.notes ? (isEl ? ex.notes.el : ex.notes.en) : null,
      videoId: ex.videoId ?? null,
    })),
  }
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
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '2 x 25',
            notes: {
              el: 'Γέφυρες με τα πέλματα ενωμένα.',
              en: 'Bridges with soles of the feet together.',
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
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Glute Bridge Pulses', en: 'Glute Bridge Pulses' },
            sets: '2 x 30',
            notes: {
              el: 'Μικρές παλμικές κινήσεις σε γέφυρα γλουτών.',
              en: 'Small pulsing movements in glute bridge.',
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
        title: { el: 'Τελείωμα', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '30 επαναλήψεις',
            notes: {
              el: 'Γέφυρες με τα πέλματα ενωμένα.',
              en: 'Bridges with soles of the feet together.',
            },
          },
        ],
      },
    ],
  },
  peach_sculpt_a: {
    meta: {
      duration: PEACH_SCULPT_DURATION,
      goal: {
        el: 'Shape · Definition · Symmetry. Το Peach Sculpt μεγιστοποιεί τον ορισμό των γλουτών διατηρώντας τη μυϊκή μάζα. Με υψηλότερο training volume, supersets, μονομερείς ασκήσεις και στοχευμένα glute pump sessions βελτιώνεις σχήμα, λεπτομέρεια και conditioning χωρίς να θυσιάζεις δύναμη.',
        en: 'Shape · Definition · Symmetry. Peach Sculpt is designed to maximize glute definition while preserving muscle mass. Through higher training volume, supersets, unilateral exercises, and strategic glute pump sessions, you improve lower-body shape, muscle detail, and overall conditioning without sacrificing strength.',
      },
      progressNote: {
        el: PEACH_SCULPT_LOAD_PLAN.el,
        en: PEACH_SCULPT_LOAD_PLAN.en,
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Διάδρομος ή ποδήλατο', en: 'Treadmill or bike' },
            sets: '3–5 λεπτά',
            notes: {
              el: 'Περπάτημα σε ανηφόρα ή ποδήλατο.',
              en: 'Incline walk or bike.',
            },
          },
        ],
      },
      {
        title: { el: 'Mobility', en: 'Mobility' },
        exercises: [
          {
            name: { el: "World's Greatest Stretch", en: "World's Greatest Stretch" },
            sets: '5 ανά πλευρά',
          },
          {
            name: { el: '90/90 Hip Rotations', en: '90/90 Hip Rotations' },
            sets: '10',
          },
          {
            name: { el: 'Hip Flexor Stretch', en: 'Hip Flexor Stretch' },
            sets: '30″ ανά πλευρά',
          },
          {
            name: { el: 'Cat / Cow', en: 'Cat / Cow' },
            sets: '10',
          },
          {
            name: { el: 'Deep Squat Hold', en: 'Deep Squat Hold' },
            sets: '30″',
          },
        ],
      },
      {
        title: { el: 'Ενεργοποίηση', en: 'Activation' },
        exercises: [
          {
            name: { el: 'Banded Lateral Walks', en: 'Banded Lateral Walks' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Glute Bridge', en: 'Glute Bridge' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '25 επαναλήψεις',
          },
        ],
      },
      {
        title: { el: 'Προτεινόμενη καρδιοαναπνευστική', en: 'Recommended cardio' },
        exercises: [
          {
            name: { el: 'Συχνότητα', en: 'Frequency' },
            notes: {
              el: '3–5 συνεδρίες ανά εβδομάδα.',
              en: '3–5 sessions per week.',
            },
          },
          {
            name: { el: 'Incline Walking', en: 'Incline Walking' },
            sets: '20–40 λεπτά',
          },
          {
            name: { el: 'Stairmaster', en: 'Stairmaster' },
            sets: '15–25 λεπτά',
            notes: {
              el: 'Εναλλακτικά με περπάτημα σε ανηφόρα.',
              en: 'Alternative to incline walking.',
            },
          },
          {
            name: { el: 'Bike', en: 'Bike' },
            sets: '25–35 λεπτά',
            notes: {
              el: 'Εναλλακτική επιλογή.',
              en: 'Alternative option.',
            },
          },
          {
            name: { el: 'Ένταση', en: 'Intensity' },
            notes: {
              el: 'Zone 2/3 — χαμηλή αερόβια, όχι μέχρι εξάντλησης.',
              en: 'Zone 2/3 — low aerobic intensity, not to exhaustion.',
            },
          },
        ],
      },
      {
        title: { el: 'Κύριο πρόγραμμα — Main Lift', en: 'Main program — Main Lift' },
        exercises: [
          {
            name: { el: 'Barbell Hip Thrust', en: 'Barbell Hip Thrust' },
            sets: '4 x 8–10',
            notes: {
              el: 'Tempo 2-1-2. Ξεκούραση 90″. Προοδευτική επιβάρυνση +2,5–5% όταν ολοκληρώνεις 10 επαναλήψεις σε όλα τα σετ με σωστό τεχνικό εύρος.',
              en: 'Tempo 2-1-2. Rest 90″. Increase load 2.5–5% once you complete 10 reps in all sets with proper technical range.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Bulgarian Split Squat', en: 'Bulgarian Split Squat' },
            sets: '3 x 10 ανά πόδι',
            notes: {
              el: '2a — εκτελείται αμέσως πριν το Leg Press.',
              en: '2a — performed immediately before Leg Press.',
            },
          },
          {
            name: { el: 'Leg Press', en: 'Leg Press' },
            sets: '3 x 15',
            notes: {
              el: '2b — ξεκούραση 75″ ανάμεσα στα σετ.',
              en: '2b — rest 75″ between sets.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Smith Reverse Lunges', en: 'Smith Reverse Lunges' },
            sets: '3 x 12 ανά πόδι',
            notes: {
              el: '3a — εκτελείται αμέσως πριν το Leg Extension.',
              en: '3a — performed immediately before Leg Extension.',
            },
          },
          {
            name: { el: 'Leg Extension', en: 'Leg Extension' },
            sets: '3 x 15–20',
            notes: {
              el: '3b — στο τελευταίο σετ: drop set 15 επαναλήψεις → μείωση βάρους → 10 επαναλήψεις → μέχρι αποτυχίας. Ξεκούραση 60″ ανάμεσα στα σετ.',
              en: '3b — on the final set: drop set 15 reps → reduce weight → 10 reps → to failure. Rest 60″ between sets.',
            },
          },
        ],
      },
      {
        title: { el: 'Απομόνωση γλουτών', en: 'Glute isolation' },
        exercises: [
          {
            name: { el: 'Cable Kickback', en: 'Cable Kickback' },
            sets: '3 x 15 ανά πόδι',
            notes: {
              el: '2″ παύση στην κορυφή κάθε επανάληψης (εκεί που σφίγγει ο γλουτός). Ξεκούραση 45″.',
              en: '2-second pause at the top of each rep (where the glute squeezes). Rest 45″.',
            },
          },
        ],
      },
      {
        title: { el: 'Finisher', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 3 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 30″ ανάμεσα στους γύρους.',
              en: 'Perform 3 rounds of the following exercises back to back. Rest 30″ between rounds.',
            },
          },
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '30 επαναλήψεις',
          },
          {
            name: { el: 'Banded Abductors', en: 'Banded Abductors' },
            sets: '30 επαναλήψεις',
          },
          {
            name: { el: 'Glute Bridge Iso Hold', en: 'Glute Bridge Iso Hold' },
            sets: '30″',
            notes: {
              el: 'Κράτημα στην πάνω θέση.',
              en: 'Hold at the top position.',
            },
          },
        ],
      },
    ],
  },
  peach_sculpt_b: {
    meta: {
      duration: PEACH_SCULPT_DURATION,
      goal: {
        el: 'WB Glute Pump Symmetry — Συμμετρία & πρήξιμο γλουτών. Αύξηση ενεργοποίησης, βελτίωση μυϊκού διαχωρισμού και συμμετρίας μέσω μονοπλευρικών ασκήσεων, υψηλού όγκου προπόνησης και στρατηγικών ασκήσεων.',
        en: 'WB Glute Pump Symmetry — increase activation, improve muscle separation and symmetry through unilateral work, high training volume, and strategic exercises.',
      },
      progressNote: {
        el: PEACH_SCULPT_LOAD_PLAN.el,
        en: PEACH_SCULPT_LOAD_PLAN.en,
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Incline Walk', en: 'Incline Walk' },
            sets: '5 λεπτά',
            notes: {
              el: 'Περπάτημα σε ανηφόρα στον διάδρομο.',
              en: 'Walking on an incline on the treadmill.',
            },
          },
          {
            name: { el: 'Banded Lateral Walk', en: 'Banded Lateral Walk' },
            sets: '20 επαναλήψεις',
            notes: {
              el: 'Πλάγιες περπατησιές με λάστιχο αντίστασης.',
              en: 'Lateral walks with a resistance band.',
            },
          },
          {
            name: { el: 'Single Leg Glute Bridge', en: 'Single Leg Glute Bridge' },
            sets: '12 ανά πόδι',
            notes: {
              el: 'Γέφυρα γλουτών στο ένα πόδι.',
              en: 'Glute bridge on one leg.',
            },
          },
          {
            name: { el: "World's Greatest Stretch", en: "World's Greatest Stretch" },
            sets: '5 ανά πλευρά',
          },
        ],
      },
      {
        title: { el: 'Κύρια άσκηση — Main Lift', en: 'Main lift' },
        exercises: [
          {
            name: { el: 'Dumbbell B-Stance Hip Thrust', en: 'Dumbbell B-Stance Hip Thrust' },
            sets: '4 x 12 ανά πόδι',
            notes: {
              el: 'Hip thrust με αλτήρα σε B-stance (ένα πόδι ελαφρώς πιο μπροστά). Tempo 2-1-2. Ξεκούραση 75″. Αύξηση φορτίου όταν ολοκληρώνεις όλες τις επαναλήψεις με πλήρη έλεγχο, ίδια ένταση και σταθερό tempo.',
              en: 'Hip thrust with a dumbbell in B-stance (one foot slightly further forward). Tempo 2-1-2. Rest 75″. Increase load when you complete all reps with full control, same intensity, and stable tempo.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Cable Kickback', en: 'Cable Kickback' },
            sets: '3 x 15 ανά πόδι',
            notes: {
              el: '2a — εκτάσεις γλουτών στην τροχαλία, χωρίς διάλειμμα πριν την επόμενη άσκηση.',
              en: '2a — cable glute kickback, performed immediately before the next exercise.',
            },
          },
          {
            name: { el: '45° Back Extensions (Glute Bias)', en: '45° Back Extensions (Glute Bias)' },
            sets: '3 x 15',
            notes: {
              el: '2b — υπερεκτάσεις στις 45° με έμφαση στους γλουτούς (ελαφρώς κυρτωμένη πλάτη, πέλματα στραμμένα προς τα έξω). Ξεκούραση 60″ μετά την ολοκλήρωση και των δύο ασκήσεων.',
              en: '2b — hyperextensions at 45° with glute emphasis (slightly rounded back, feet turned outward). Rest 60″ after completing both exercises.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset (normal)', en: 'Superset (normal)' },
        exercises: [
          {
            name: { el: 'Seated Hip Abduction', en: 'Seated Hip Abduction' },
            sets: '3 x 20',
            notes: {
              el: '3a — εκτελείται αμέσως πριν το Standing Cable Abduction.',
              en: '3a — performed immediately before Standing Cable Abduction.',
            },
          },
          {
            name: { el: 'Standing Cable Abduction', en: 'Standing Cable Abduction' },
            sets: '3 x 15 ανά πόδι',
            notes: {
              el: '3b — ξεκούραση 45″ ανάμεσα στα σετ.',
              en: '3b — rest 45″ between sets.',
            },
          },
        ],
      },
      {
        title: { el: 'Burnout', en: 'Burnout' },
        exercises: [
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '2 x 40',
            notes: {
              el: 'Smith, μπάρα ή αλτήρες.',
              en: 'Smith machine, barbell, or dumbbell.',
            },
          },
          {
            name: { el: 'Banded Abductor Pulses', en: 'Banded Abductor Pulses' },
            sets: '2 x 30',
            notes: {
              el: 'Ξεκούραση 30″ ανάμεσα στα σετ.',
              en: 'Rest 30″ between sets.',
            },
          },
        ],
      },
      {
        title: { el: 'Finisher', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 3 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 45″ ανάμεσα στους γύρους.',
              en: 'Perform 3 rounds of the following exercises back to back. Rest 45″ between rounds.',
            },
          },
          {
            name: { el: 'Walking Lunges', en: 'Walking Lunges' },
            sets: '20 βήματα',
          },
          {
            name: { el: 'Bodyweight Sumo Squat', en: 'Bodyweight Sumo Squat' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Wall Sit', en: 'Wall Sit' },
            sets: '45″',
          },
        ],
      },
    ],
  },
  peach_sculpt_c: {
    meta: {
      duration: PEACH_SCULPT_DURATION,
      goal: {
        el: 'Posterior chain focus — δυνάμωσε οπίσθιους και γλουτούς με controlled RDL progressions, μονοπλευρική δουλειά, pull-throughs και στοχευμένο isolation.',
        en: 'Posterior chain focus — strengthen hamstrings and glutes through controlled RDL progressions, unilateral work, pull-throughs, and targeted isolation.',
      },
      progressNote: {
        el: PEACH_SCULPT_LOAD_PLAN.el,
        en: PEACH_SCULPT_LOAD_PLAN.en,
      },
    },
    sections: [
      {
        title: { el: 'Ζέσταμα', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Incline Walk', en: 'Incline Walk' },
            sets: '5 λεπτά',
            notes: {
              el: 'Περπάτημα σε ανηφόρα.',
              en: 'Walking on an incline.',
            },
          },
          {
            name: { el: 'RDL with PVC or Empty Barbell', en: 'RDL with PVC or Empty Barbell' },
            notes: {
              el: 'Ρουμανικές άρσεις θανάτου με PVC ή άδεια μπάρα για ενεργοποίηση.',
              en: 'Romanian deadlifts with a PVC pipe or empty barbell to activate.',
            },
          },
          {
            name: { el: 'Glute Bridge', en: 'Glute Bridge' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Banded Good Morning', en: 'Banded Good Morning' },
            sets: '15 επαναλήψεις',
          },
          {
            name: { el: 'Dynamic Clams Stretch', en: 'Dynamic Clams Stretch' },
            sets: '10 ανά πόδι',
          },
        ],
      },
      {
        title: { el: 'Κύρια άσκηση — Main Lift', en: 'Main lift' },
        exercises: [
          {
            name: { el: 'RDL (Romanian Deadlifts)', en: 'RDL (Romanian Deadlifts)' },
            sets: '4 x 8',
            notes: {
              el: 'Tempo 3-1-1-1 (3″ κάθοδος, 1″ παύση κάτω, 1″ ανέβασμα, 1″ παύση πάνω). Ξεκούραση 90″. Προοδευτική επιβάρυνση +2,5–5% όταν βγαίνουν τα σετ με σωστή τεχνική.',
              en: 'Tempo 3-1-1-1 (3″ descent, 1″ pause at bottom, 1″ ascent, 1″ pause at top). Rest 90″. Increase load 2.5–5% when sets are completed with proper technique.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Single Leg RDL', en: 'Single Leg RDL' },
            sets: '3 x 10 ανά πόδι',
            notes: {
              el: '2a — ρουμανικές άρσεις θανάτου στο ένα πόδι, χωρίς διάλειμμα πριν την επόμενη άσκηση.',
              en: '2a — single-leg Romanian deadlift, performed immediately before the next exercise.',
            },
          },
          {
            name: { el: 'Lying Leg Curl', en: 'Lying Leg Curl' },
            sets: '3 x 12',
            notes: {
              el: '2b — κάμψεις μηριαίων σε μηχάνημα. Ξεκούραση 75″ μετά την ολοκλήρωση και των δύο ασκήσεων.',
              en: '2b — lying hamstring curl on machine. Rest 75″ after completing both exercises.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Cable Pull Through', en: 'Cable Pull Through' },
            sets: '3 x 15',
            notes: {
              el: '3a — εκτάσεις ισχίου στην τροχαλία ανάμεσα από τα πόδια.',
              en: '3a — cable pull-through between the legs.',
            },
          },
          {
            name: { el: 'Hyper Extension', en: 'Hyper Extension' },
            sets: '3 x 15',
            notes: {
              el: '3b — υπερεκτάσεις κορμού στην καρέκλα ρωμαϊκού πάγκου. Ξεκούραση 60″ μετά την ολοκλήρωση και των δύο ασκήσεων.',
              en: '3b — hyperextensions on the Roman chair. Rest 60″ after completing both exercises.',
            },
          },
        ],
      },
      {
        title: { el: 'Απομόνωση', en: 'Isolation' },
        exercises: [
          {
            name: { el: 'Seated Leg Curl', en: 'Seated Leg Curl' },
            sets: '2 x 15–20',
            notes: {
              el: 'Στο τελευταίο σετ: drop set 15 πλήρεις επαναλήψεις → 10 μισές επαναλήψεις → μέχρι τεχνική αποτυχία.',
              en: 'On the final set: drop set 15 full reps → 10 half reps → to technical failure.',
            },
          },
        ],
      },
      {
        title: { el: 'Finisher', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 3 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 30″ ανάμεσα στους γύρους.',
              en: 'Perform 3 rounds of the following exercises back to back. Rest 30″ between rounds.',
            },
          },
          {
            name: { el: 'Kettlebell Swings', en: 'Kettlebell Swings' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Banded Good Mornings', en: 'Banded Good Mornings' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Glute Bridge Hold', en: 'Glute Bridge Hold' },
            sets: '45″',
          },
        ],
      },
    ],
  },
  peach_sculpt_d: {
    meta: {
      duration: PEACH_SCULPT_DURATION,
      goal: {
        el: 'Leg volume & pump — χτίσε σχήμα και conditioning με elevated split squats, compound supersets, leg extensions και high-rep finishers.',
        en: 'Leg volume and pump — build lower-body shape and conditioning through elevated split squats, compound supersets, leg extensions, and high-rep finishers.',
      },
      progressNote: {
        el: PEACH_SCULPT_LOAD_PLAN.el,
        en: PEACH_SCULPT_LOAD_PLAN.en,
      },
    },
    sections: [
      {
        title: { el: 'Κύρια άσκηση — Main Lift', en: 'Main lift' },
        exercises: [
          {
            name: {
              el: 'Front Foot Elevated Bulgarian Split Squat',
              en: 'Front Foot Elevated Bulgarian Split Squat',
            },
            sets: '4 x 10 ανά πόδι',
            notes: {
              el: 'Bulgarian split squats με ανασηκωμένο το μπροστινό πόδι. Tempo 3-1-1-1. Ξεκούραση 2,5 λεπτά. Αύξηση φορτίου όταν ολοκληρώνεις όλες τις επαναλήψεις με πλήρες εύρος κίνησης και σταθερότητα.',
              en: 'Bulgarian split squats with the front foot elevated. Tempo 3-1-1-1. Rest 2.5 minutes. Increase load when you complete all reps with full range of motion and stability.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Hack Squat / Pendulum Squat', en: 'Hack Squat / Pendulum Squat' },
            sets: '3 x 12',
            notes: {
              el: '2a — εκτελείται αμέσως πριν τις Walking Lunges.',
              en: '2a — performed immediately before Walking Lunges.',
            },
          },
          {
            name: { el: 'Walking Lunges', en: 'Walking Lunges' },
            sets: '3 x 20 βήματα',
            notes: {
              el: '2b — ξεκούραση 2 λεπτά μετά την ολοκλήρωση και των δύο ασκήσεων.',
              en: '2b — rest 2 minutes after completing both exercises.',
            },
          },
        ],
      },
      {
        title: { el: 'Superset', en: 'Superset' },
        exercises: [
          {
            name: { el: 'Leg Extension', en: 'Leg Extension' },
            sets: '3 x 12',
            notes: {
              el: '3a — εκτελείται αμέσως πριν τα Seated Hip Abductions.',
              en: '3a — performed immediately before Seated Hip Abductions.',
            },
          },
          {
            name: { el: 'Seated Hip Abduction', en: 'Seated Hip Abduction' },
            sets: '3 x 20',
            notes: {
              el: '3b — στο τελευταίο σετ: drop set + όσες επαναλήψεις βγουν. Ξεκούραση 45–60″ μετά την ολοκλήρωση και των δύο ασκήσεων.',
              en: '3b — on the final set: drop set plus as many reps as possible. Rest 45–60″ after completing both exercises.',
            },
          },
        ],
      },
      {
        title: { el: 'Finisher', en: 'Finisher' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 3 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 30″ ανάμεσα στους γύρους.',
              en: 'Perform 3 rounds of the following exercises back to back. Rest 30″ between rounds.',
            },
          },
          {
            name: { el: 'Jump Squats', en: 'Jump Squats' },
            sets: '15 επαναλήψεις',
            notes: {
              el: 'Εναλλακτικά sumo squats.',
              en: 'Alternatively, sumo squats.',
            },
          },
          {
            name: { el: 'Banded Abduction Pulses', en: 'Banded Abduction Pulses' },
            sets: '30 επαναλήψεις',
            notes: {
              el: 'Συνήθως σε καθιστή θέση.',
              en: 'Usually performed seated.',
            },
          },
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '30 επαναλήψεις',
          },
        ],
      },
    ],
  },
  peach_sculpt_e: {
    meta: {
      duration: PEACH_SCULPT_DURATION,
      goal: {
        el: 'Αύξηση γενικής φυσικής κατάστασης, μέγιστη θερμιδική κατανάλωση και βελτίωση γράμμωσης γλουτών μέσω μεταβολικών κύκλων, υψηλών επαναλήψεων για γλουτούς και χαμηλής έντασης αερόβιου.',
        en: 'Increase overall conditioning, maximize calorie expenditure, and enhance glute definition through metabolic circuits, high-rep glute work, and low-intensity aerobic training.',
      },
      progressNote: {
        el: PEACH_SCULPT_LOAD_PLAN.el,
        en: PEACH_SCULPT_LOAD_PLAN.en,
      },
    },
    sections: [
      {
        title: { el: 'Προθέρμανση', en: 'Warm up' },
        exercises: [
          {
            name: { el: 'Incline Walk', en: 'Incline Walk' },
            sets: '5 λεπτά',
            notes: {
              el: 'Περπάτημα σε ανηφόρα.',
              en: 'Walking on an incline.',
            },
          },
          {
            name: { el: 'Dynamic Hip Mobility', en: 'Dynamic Hip Mobility' },
            sets: '5 ανά πλευρά',
          },
          {
            name: { el: 'Banded Lateral Walk', en: 'Banded Lateral Walk' },
            sets: '20 επαναλήψεις',
          },
          {
            name: { el: 'Glute Bridge', en: 'Glute Bridge' },
            sets: '15 επαναλήψεις',
          },
        ],
      },
      {
        title: { el: 'Κύκλος φυσικής κατάστασης', en: 'Conditioning circuit' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 4 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 90″ στο τέλος κάθε γύρου.',
              en: 'Perform 4 rounds of the following exercises back to back. Rest 90″ at the end of each round.',
            },
          },
          {
            name: { el: 'Sled Push', en: 'Sled Push' },
            sets: '20 μέτρα',
          },
          {
            name: { el: 'Incline Treadmill', en: 'Incline Treadmill' },
            sets: '60″',
          },
          {
            name: { el: 'Walking Lunges', en: 'Walking Lunges' },
            sets: '20 βήματα',
          },
          {
            name: { el: 'Box Step Ups', en: 'Box Step Ups' },
            sets: '12 ανά πόδι',
          },
          {
            name: { el: 'Battle Ropes', en: 'Battle Ropes' },
            sets: '30″',
          },
        ],
      },
      {
        title: { el: 'Glute Pump Superset', en: 'Glute Pump Superset' },
        exercises: [
          {
            name: { el: 'Cable Kickback', en: 'Cable Kickback' },
            sets: '3 x 20 ανά πόδι',
            notes: {
              el: '2a — εκτελείται αμέσως πριν τα Seated Hip Abductions.',
              en: '2a — performed immediately before Seated Hip Abductions.',
            },
          },
          {
            name: { el: 'Seated Hip Abduction', en: 'Seated Hip Abduction' },
            sets: '3 x 25',
            notes: {
              el: '2b — ξεκούραση 45″ ανάμεσα στα σετ.',
              en: '2b — rest 45″ between sets.',
            },
          },
        ],
      },
      {
        title: { el: 'Burnout Circuit', en: 'Burnout Circuit' },
        exercises: [
          {
            name: { el: 'Οδηγίες κυκλικού', en: 'Circuit instructions' },
            notes: {
              el: 'Εκτέλεσε 3 γύρους από τις παρακάτω ασκήσεις τη μία μετά την άλλη. Ξεκούραση 30″ ανάμεσα στους γύρους.',
              en: 'Perform 3 rounds of the following exercises back to back. Rest 30″ between rounds.',
            },
          },
          {
            name: { el: 'Frog Pumps', en: 'Frog Pumps' },
            sets: '40 επαναλήψεις',
          },
          {
            name: { el: 'Fire Hydrants', en: 'Fire Hydrants' },
            sets: '20 ανά πόδι',
          },
          {
            name: { el: 'Donkey Kicks', en: 'Donkey Kicks' },
            sets: '20 ανά πόδι',
          },
          {
            name: { el: 'Banded Abductions (Pulse)', en: 'Banded Abductions (Pulse)' },
            sets: '30 επαναλήψεις',
          },
        ],
      },
      {
        title: { el: 'Προτεινόμενη καρδιοαναπνευστική', en: 'Recommended cardio' },
        exercises: [
          {
            name: { el: 'Incline Walk', en: 'Incline Walk' },
            sets: '20–30 λεπτά',
            notes: {
              el: 'Εναλλακτικά Stairmaster ή ποδήλατο.',
              en: 'Alternatively, Stairmaster or bike.',
            },
          },
          {
            name: { el: 'Stairmaster', en: 'Stairmaster' },
            sets: '15–20 λεπτά',
          },
          {
            name: { el: 'Bike', en: 'Bike' },
            sets: '25–30 λεπτά',
          },
          {
            name: { el: 'Ένταση', en: 'Intensity' },
            notes: {
              el: 'Zone 2/3 — σταθερός ρυθμός, χωρίς εξάντληση.',
              en: 'Zone 2/3 — steady pace, without exhaustion.',
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
    sections: raw.sections.map((section) => mapSectionForApi(section, isEl)).concat([
      mapSectionForApi(PEACH_COOL_DOWN_SECTION, isEl),
    ]),
  }
}
