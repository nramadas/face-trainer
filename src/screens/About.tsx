import { Card, PageHeader, SectionTitle } from '../components/ui';

export function About() {
  return (
    <div className="pb-6">
      <PageHeader title="About" subtitle="Stage Face" back="/settings" />
      <div className="space-y-4 text-[15px] leading-relaxed text-muted">
        <p className="text-ink">
          Stage Face helps actors build a clear, different face for each emotion, and bring it back fast and on cue.
        </p>
        <p>
          Each session teaches one new emotion: what it is, how to build the face one part at a time, and how it differs from its closest look-alike. Then it brings back
          emotions you have learned, right before you are likely to forget them. This is called spaced repetition. Scheduling uses FSRS, the same method modern Anki uses.
        </p>
      </div>

      <SectionTitle>Credits</SectionTitle>
      <Card className="space-y-3 p-4 text-[15px] leading-relaxed text-muted">
        <p className="text-ink">
          Emotion names and groups from <em>Atlas of the Heart</em> by Brené Brown.
        </p>
        <p>The definitions, face guides and practice lines in this app are written in our own words.</p>
        <p>
          Face cues are based on the Facial Action Coding System (FACS) by Paul Ekman and Wallace Friesen, and on research by Dacher Keltner and others on shame,
          embarrassment, pride, awe and related expressions.
        </p>
        <p>Scheduling uses the open-source FSRS algorithm (ts-fsrs).</p>
        <p>The photo faces are AI-generated and show two invented people. They are made ahead of time, not in the app.</p>
      </Card>

      <SectionTitle>Privacy</SectionTitle>
      <Card className="space-y-3 p-4 text-[15px] leading-relaxed text-muted">
        <p>There are no accounts, no analytics and no tracking. Your progress is stored only in this browser on this device.</p>
        <p>The mirror uses your camera only while it is on. Nothing is recorded, saved or sent anywhere.</p>
      </Card>
      <p className="mt-6 text-center text-xs text-faint">Version {__APP_VERSION__}</p>
    </div>
  );
}
