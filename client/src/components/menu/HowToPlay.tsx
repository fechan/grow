import { FancyButton } from "../FancyButton";

export function HowToPlay({ onClickBack }: { onClickBack: () => void }) {
  return (
    <div className="flex flex-col w-80 md:w-180 lg:w-300 p-5">
      <h1 className="text-3xl font-bold text-center mb-5">How to play Grow</h1>
      <article className="overflow-scroll scroll-y h-100 lg:h-full mb-5">
        <section className="mb-3 border-s ps-3 hover:border-white border-stone-500">
          <h2 className="text-2xl font-bold">Materials</h2>
          <dl>
            <div className="mb-2">
              <dt className="font-bold">Board</dt>
              <dd>A 15x15 Go board, where each intersection is a <b>space</b>.</dd>
            </div>
            <div>
              <dt className="font-bold">Stones</dt>
              <dd>Each player (red, blue, green, yellow) gets light-colored <b>head stones</b> and dark-colored <b>tail stones</b> of their color.</dd>
            </div>
          </dl>
        </section>
        <section className="mb-3 border-s ps-3 hover:border-white border-stone-500">
          <h2 className="text-2xl font-bold">Object of the game</h2>
          <p>Fill up as much of the board as possible with stones of your own color.</p>
        </section>
        <section className="mb-3 border-s ps-3 hover:border-white border-stone-500">
          <h2 className="text-2xl font-bold">Main gameplay</h2>
            <section className="mb-3">
              <h3 className="font-bold">Dropping new head stones</h3>
              <p>
                Each turn, you may place one of your own <b>head stones</b> on any unoccupied space on the board. <aside className="text-stone-400 inline"> You may do this at any time during your turn.</aside>
              </p>
            </section>
            <section>
              <h3 className="font-bold">Moving old head stones</h3>
              <p className="mb-3">
                Each turn, any of your own <b>head stones</b> that were dropped on previous turns may be moved to an adjacent empty space. If the space it moved from would become empty, put a <b>tail stone</b> of your color there instead.
              </p>
              <p className="mb-3">
                Alternatively, if your <b>head stone</b> is adjacent to a contiguous group of your own stones, you may move your <b>head stone</b> to any space in that group.
              </p>
              <p className="mb-3">
                Once a <b>head stone</b> has been moved, it cannot be moved again until your next turn.
              </p>
              <aside className="text-stone-400">
                Diagonals are not considered adjacent. Multiple of your own stones may occupy the same space by stacking stones. You may choose not to move any given head stone on your turn.
              </aside>
            </section>
        </section>
        <section className="border-s ps-3 hover:border-white border-stone-500">
          <h2 className="text-2xl font-bold">Ending the game</h2>
          <p>The game ends when all spaces are occupied by stones. Each space occupied by one or more of your stones counts for 1 point. The player with the most points wins.</p>
        </section>
      </article>

      <FancyButton onClick={ onClickBack }>Back to main menu</FancyButton>
    </div>
  );
}