import { ButtonLink } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-32 pb-20 text-center">
      <StarMark className="h-16 w-16" />
      <h1 className="display-lg mt-8">We couldn’t find that page.</h1>
      <p className="lede mt-4 max-w-xl">
        It may have moved while we refreshed the site. Try the home page, or call us at {site.phone.display} and
        we’ll help.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">Back to home</ButtonLink>
        <ButtonLink href="/schedule-a-tour" size="lg" variant="ghost">Contact us</ButtonLink>
      </div>
    </div>
  );
}
