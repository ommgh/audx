import { TimelineSection } from "@/components/changelog/timeline";
import UpdatesInput from "@/components/changelog/updates-input";
import { Header } from "@/components/header";

const Home = () => {
  return (
    <div className="flex min-h-svh min-w-0 flex-col overflow-x-hidden">
      <Header />
      <section className="mx-auto w-full max-w-6xl min-w-0 border-x">
        <UpdatesInput />
        <div className="via-primary/20 mx-auto h-px w-4/5 bg-linear-to-r from-transparent to-transparent"></div>
        <TimelineSection />
      </section>
    </div>
  );
};

export default Home;
