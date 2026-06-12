import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function UpdatesInput() {
  return (
    <section id="home" className="-mt-17.5 pt-17.5">
      <div className="min-w-0 space-y-4 px-4 py-8 text-center md:px-8 md:py-16">
        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
          Changelog
        </h2>
        <p className="text-muted-foreground text-base sm:text-xl">
          See what&apos;s new added, changed, fixed, improved or updated
        </p>
        <div className="mx-auto flex w-full max-w-sm min-w-0 gap-3 max-sm:flex-col max-sm:items-stretch">
          <Input
            type="text"
            placeholder="Your email"
            className="input-lg px-3"
          />
          <Button>Subscribe</Button>
        </div>
      </div>
    </section>
  );
}

export default UpdatesInput;
