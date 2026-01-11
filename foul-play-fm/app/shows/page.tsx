import Button from "../components/Button";import ShowsGrid from "../components/ShowsGrid";

export default function Shows() {
  return (
    <div className="flex min-h-screen items-center w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto flex-col">
      <main className="flex flex-col gap-12 md:gap-16 lg:gap-24 w-full">
        <section className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center w-full">
          <div className="flex flex-col w-full items-center text-center gap-4 md:gap-5 lg:gap-6">
            <h1 className="font-headings font-bold text-4xl md:text-5xl lg:text-6xl">Our Shows</h1>
            <p className="font-sans font-normal text-lg md:text-xl ">Repellat aut amet perferendis. Sint vel aliquid nulla. Facilis ut odio qui voluptates sunt sed.</p>
            <Button text="Listen Now" href="/listen-live"/>  
          </div>
        </section>
        {/*Now playing section*/}<section></section>
        {/*All shows*/}
        <section className="w-full">
          <ShowsGrid />
        </section>
      </main>
    </div>
  );
}