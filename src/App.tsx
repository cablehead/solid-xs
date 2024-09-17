import { Component, For, Show } from "solid-js";
import { StreamedItem, useStreamedItems } from "./useStreamedItems";

const Nav: Component<{ items: StreamedItem[] }> = (props) => (
  <nav>
    <ul>
      <For each={props.items}>
        {(item) => (
          <li>
            {item.topic}
          </li>
        )}
      </For>
    </ul>
  </nav>
);

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
        <Nav items={state.items} />
      </main>
    </div>
  );
};

export default App;
