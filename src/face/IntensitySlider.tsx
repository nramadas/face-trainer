import { Slider } from '@base-ui/react/slider';
import { INTENSITY_STOPS, intensityLabel } from './params';

export function IntensitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Slider.Root value={value} onValueChange={(v) => onChange(v as number)} min={0} max={1.5} step={0.05} className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <Slider.Label className="text-sm font-medium text-muted">Intensity</Slider.Label>
        <span className="text-sm font-medium text-ink">{intensityLabel(value)}</span>
      </div>
      <Slider.Control className="flex h-8 w-full touch-none items-center select-none">
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-white/12">
          <Slider.Indicator className="rounded-full bg-gradient-to-r from-accent-strong to-accent" />
          <Slider.Thumb
            getAriaValueText={(_, v) => intensityLabel(v)}
            className="size-6 rounded-full border-2 border-accent bg-white shadow-[0_0_0_4px_rgba(47,164,176,0.25)] outline-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-text"
          />
        </Slider.Track>
      </Slider.Control>
      <div className="mt-1 flex justify-between text-xs text-faint" aria-hidden>
        {INTENSITY_STOPS.map((s) => (
          <button key={s.label} type="button" tabIndex={-1} className="hover:text-ink" onClick={() => onChange(s.value)}>
            {s.label}
          </button>
        ))}
      </div>
    </Slider.Root>
  );
}
