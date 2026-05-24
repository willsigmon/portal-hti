import { Photo } from "./Photo";

export function ImpactStories() {
  const stories = [
    {
      quote: "My son can finally do his homework without going to the library after dark.",
      name: "Lacrecia H.",
      location: "Durham County",
      photo: "/images/impact/lacrecia.jpg",
    },
    {
      quote: "I got my first remote job because of this laptop. Changed everything for my family.",
      name: "Marcus T.",
      location: "Wilson County",
      photo: "/images/impact/marcus.jpg",
    },
    {
      quote: "My daughter is teaching me how to use Zoom now. We laugh about it every week.",
      name: "Ms. Evelyn R.",
      location: "Edgecombe County",
      photo: "/images/impact/evelyn.jpg",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <div className="uppercase text-xs tracking-[3px] text-[var(--color-muted)] mb-3">REAL STORIES</div>
        <h3 className="display-lg tracking-[-0.04em]">Behind every laptop is a real person whose world just got bigger.</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {stories.map((story, index) => (
          <div key={index} className="space-y-5">
            <div className="aspect-[4/5] rounded-[var(--radius-lg)] bg-[var(--color-bg-dark)] flex items-center justify-center text-[var(--color-muted-dark)] text-sm tracking-widest ring-1 ring-white/10">
            [Real photo of {story.name} — {story.location}]
          </div>
          <div className="text-xs text-[var(--color-muted)] px-1">— {story.name}, {story.location}</div>
            <blockquote className="text-lg leading-snug font-light">
              “{story.quote}”
            </blockquote>
          </div>
        ))}
      </div>

      <div className="text-sm text-[var(--color-muted)] pt-4">
        Photos and stories used with permission. Every device we place has a story like this.
      </div>
    </div>
  );
}
