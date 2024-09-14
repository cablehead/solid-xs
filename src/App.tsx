import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

const App: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const response = await fetch("/api", { signal });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split("\n");

          // Leave the last partial line in the buffer
          buffer = lines.pop()!;

          for (let line of lines) {
            if (line.trim()) {
              try {
                const json = JSON.parse(line);
                setItems((prev) => [json, ...prev]);
                setLoading(false);
              } catch (e) {
                console.error("Failed to parse line", line, e);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            setItems((prev) => [json, ...prev]);
            setLoading(false);
          } catch (e) {
            console.error("Failed to parse buffer", buffer, e);
          }
        }

        reader.releaseLock();
        setLoading(false);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <div>
      <h1>Solid App with Streaming Data</h1>
      <Show when={error()}>
        <p style={{ color: "red" }}>Error: {error()}</p>
      </Show>
      <Show when={loading()}>
        <p>Loading...</p>
      </Show>
      <ul>
        <For each={items()}>
          {(item) => <li>{JSON.stringify(item)}</li>}
        </For>
      </ul>
    </div>
  );
};

export default App;
