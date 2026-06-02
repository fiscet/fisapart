import SearchChat from '@/components/SearchChat';
import { FeaturesModal } from '@/components/FeaturesModal';

export function HeroSection() {
  return (
    <section
      className="hero-section from-primary to-background bg-gradient-to-br px-4 py-20 w-full"
      data-testid="hero-section"
    >
      <div className="mx-auto max-w-4xl text-center w-full">
        <h2
          className="text-primary-foreground mb-6 text-4xl font-bold md:text-6xl"
          data-testid="text-hero-title"
        >
          FisApart
        </h2>
        <p className="text-primary-foreground/90 mb-12 text-xl" data-testid="text-hero-subtitle">
          Holiday apartment rentals. Easy search, easy booking.
        </p>

        {/* Search Component */}
        <div className="w-full">
          <SearchChat />
        </div>

        {/* How it works + demo notice */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <FeaturesModal />
          <p
            className="text-primary-foreground/80 text-sm"
            data-testid="text-demo-notice"
          >
            This is a demo site — apartments and bookings are not real.
          </p>
        </div>
      </div>
    </section>
  );
}
