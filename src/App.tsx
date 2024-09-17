import { Component, For, Show } from "solid-js";
import { useStreamedItems } from "./useStreamedItems";

const App: Component = () => {
  const { state } = useStreamedItems();

  return (
    <div>
      <Show when={state.error}>
        <p style={{ color: "red" }}>Error: {state.error}</p>
      </Show>
      <Show when={state.loading}>
        <p>Loading...</p>
      </Show>
      <main>
        <ul>
          <For each={state.items}>
            {(item) => (
              <li>
                {item.topic}
                {item.meta ? ` -- ${JSON.stringify(item.meta)}` : ""}
              </li>
            )}
          </For>
        </ul>
      </main>
    </div>
  );
};

export default App;